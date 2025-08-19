/**
 * Тестовый файл для проверки работы системы обработки координат
 */

const CoordinateProcessor = require('./utils/coordinateProcessor');

// Создаем тестовые данные - симуляция GPS координат с шумом
function generateTestCoordinates() {
    const baseLat = 55.751244; // Москва
    const baseLng = 37.618423;
    const positions = [];
    
    // Генерируем 50 точек с разным уровнем шума
    for (let i = 0; i < 50; i++) {
        const time = new Date(Date.now() + i * 60000); // каждая точка через минуту
        
        // Добавляем реалистичное движение + шум
        const movementLat = Math.sin(i * 0.1) * 0.001; // плавное движение
        const movementLng = Math.cos(i * 0.1) * 0.001;
        
        // Добавляем GPS шум (случайные отклонения)
        const noiseLat = (Math.random() - 0.5) * 0.0001; // ±50 метров
        const noiseLng = (Math.random() - 0.5) * 0.0001;
        
        // Добавляем выбросы (каждые 10 точек)
        let outlierLat = 0;
        let outlierLng = 0;
        if (i % 10 === 0 && i > 0) {
            outlierLat = (Math.random() - 0.5) * 0.01; // ±5 км выброс
            outlierLng = (Math.random() - 0.5) * 0.01;
        }
        
        const lat = baseLat + movementLat + noiseLat + outlierLat;
        const lng = baseLng + movementLng + noiseLng + outlierLng;
        
        positions.push({
            coords: [lat, lng],
            timestamp: time
        });
    }
    
    return positions;
}

// Тестируем разные настройки процессора
function testProcessorSettings() {
    console.log('🧪 Тестирование различных настроек процессора\n');
    
    const testPositions = generateTestCoordinates();
    console.log(`📊 Исходные данные: ${testPositions.length} точек`);
    
    // Тест 1: Стандартные настройки
    console.log('\n🔧 Тест 1: Стандартные настройки');
    const processor1 = new CoordinateProcessor();
    const result1 = processor1.processCoordinates(testPositions);
    const stats1 = processor1.getProcessingStats(testPositions, result1);
    console.log('Результат:', stats1);
    
    // Тест 2: Более строгая фильтрация
    console.log('\n🔧 Тест 2: Строгая фильтрация (макс. скорость 50 км/ч)');
    const processor2 = new CoordinateProcessor({
        maxSpeedKmh: 50,
        clusterRadiusMeters: 10,
        timeWindowMs: 15000
    });
    const result2 = processor2.processCoordinates(testPositions);
    const stats2 = processor2.getProcessingStats(testPositions, result2);
    console.log('Результат:', stats2);
    
    // Тест 3: Мягкая фильтрация
    console.log('\n🔧 Тест 3: Мягкая фильтрация (макс. скорость 200 км/ч)');
    const processor3 = new CoordinateProcessor({
        maxSpeedKmh: 200,
        clusterRadiusMeters: 50,
        timeWindowMs: 60000
    });
    const result3 = processor3.processCoordinates(testPositions);
    const stats3 = processor3.getProcessingStats(testPositions, result3);
    console.log('Результат:', stats3);
    
    return { testPositions, result1, result2, result3, stats1, stats2, stats3 };
}

// Тестируем отдельные алгоритмы
function testIndividualAlgorithms() {
    console.log('\n🔬 Тестирование отдельных алгоритмов\n');
    
    const testPositions = generateTestCoordinates();
    const processor = new CoordinateProcessor();
    
    // Тест фильтрации по скорости
    console.log('📊 Тест фильтрации по скорости:');
    const speedFiltered = processor.filterBySpeed(testPositions);
    console.log(`Исходные: ${testPositions.length} -> Отфильтрованные: ${speedFiltered.length}`);
    
    // Тест группировки по времени
    console.log('\n⏰ Тест группировки по времени:');
    const timeGroups = processor.groupByTime(speedFiltered);
    console.log(`Групп по времени: ${timeGroups.length}`);
    
    // Тест кластеризации
    console.log('\n🎯 Тест кластеризации:');
    let totalClusters = 0;
    for (const group of timeGroups) {
        const clusters = processor.clusterPositions(group);
        totalClusters += clusters.length;
    }
    console.log(`Всего кластеров: ${totalClusters}`);
}

// Тестируем с реальными данными (если есть)
async function testWithRealData() {
    console.log('\n📈 Тестирование с реальными данными\n');
    
    try {
        // Проверяем переменные окружения
        if (!process.env.DB_HOST) {
            console.log('⚠️ Переменные окружения не загружены, пропускаем тест с реальными данными');
            console.log('💡 Для тестирования с реальными данными запустите:');
            console.log('   docker-compose exec backend node test-coordinate-processing.js');
            return;
        }
        
        const db = require('./db');
        
        // Получаем сессию с координатами
        const query = `
            SELECT s.id, s.user_id, COUNT(p.id) as position_count
            FROM sessions s
            JOIN positions p ON s.id = p.session_id
            GROUP BY s.id, s.user_id
            HAVING COUNT(p.id) > 10
            ORDER BY position_count DESC
            LIMIT 1
        `;
        
        const { rows } = await db.query(query);
        
        if (rows.length === 0) {
            console.log('❌ Нет данных для тестирования в базе');
            return;
        }
        
        const sessionId = rows[0].id;
        console.log(`📋 Тестируем сессию ${sessionId} с ${rows[0].position_count} позициями`);
        
        // Получаем позиции
        const positionsQuery = `
            SELECT latitude, longitude, timestamp
            FROM positions 
            WHERE session_id = $1
            ORDER BY timestamp ASC
        `;
        
        const { rows: positions } = await db.query(positionsQuery, [sessionId]);
        
        if (positions.length === 0) {
            console.log('❌ Нет позиций в сессии');
            return;
        }
        
        // Преобразуем в формат для процессора
        const formattedPositions = positions.map(row => ({
            coords: [parseFloat(row.latitude), parseFloat(row.longitude)],
            timestamp: new Date(row.timestamp)
        }));
        
        console.log(`📍 Получено ${formattedPositions.length} позиций`);
        
        // Обрабатываем координаты
        const processor = new CoordinateProcessor();
        const processed = processor.processCoordinates(formattedPositions);
        const stats = processor.getProcessingStats(formattedPositions, processed);
        
        console.log('📊 Результат обработки:', stats);
        
        // Показываем первые несколько точек
        console.log('\n📍 Первые 5 исходных точек:');
        formattedPositions.slice(0, 5).forEach((pos, i) => {
            console.log(`${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()}`);
        });
        
        console.log('\n📍 Первые 5 обработанных точек:');
        processed.slice(0, 5).forEach((pos, i) => {
            console.log(`${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()} (${pos.originalCount} исходных)`);
        });
        
    } catch (error) {
        console.error('❌ Ошибка при тестировании с реальными данными:', error);
    }
}

// Главная функция тестирования
async function runTests() {
    console.log('🚀 Запуск тестов системы обработки координат\n');
    
    // Тест 1: Синтетические данные
    testProcessorSettings();
    
    // Тест 2: Отдельные алгоритмы
    testIndividualAlgorithms();
    
    // Тест 3: Реальные данные
    await testWithRealData();
    
    console.log('\n✅ Тестирование завершено');
}

// Запускаем тесты если файл вызван напрямую
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testProcessorSettings,
    testIndividualAlgorithms,
    testWithRealData,
    runTests
}; 