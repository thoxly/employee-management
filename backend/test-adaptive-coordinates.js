/**
 * Тест адаптивного алгоритма обработки координат
 */

const CoordinateProcessor = require('./utils/coordinateProcessor');

// Генерируем данные для разных типов движения
function generateMovementData(type, count = 100) {
    const baseLat = 56.323717;
    const baseLng = 44.037224;
    const positions = [];
    
    let speedRange;
    let noiseLevel;
    
    switch (type) {
        case 'walking':
            speedRange = { min: 0.5, max: 6 }; // 0.5-6 км/ч
            noiseLevel = 0.00005; // ±25 метров
            break;
        case 'scooter':
            speedRange = { min: 8, max: 20 }; // 8-20 км/ч
            noiseLevel = 0.0001; // ±50 метров
            break;
        case 'car':
            speedRange = { min: 20, max: 60 }; // 20-60 км/ч
            noiseLevel = 0.0002; // ±100 метров
            break;
        case 'train':
            speedRange = { min: 40, max: 120 }; // 40-120 км/ч
            noiseLevel = 0.0003; // ±150 метров
            break;
        default:
            speedRange = { min: 1, max: 10 };
            noiseLevel = 0.0001;
    }
    
    // Генерируем точки с реалистичным движением
    for (let i = 0; i < count; i++) {
        const time = new Date('2025-08-11T14:17:13.381Z');
        time.setMinutes(time.getMinutes() + i * 2); // каждая точка через 2 минуты
        
        // Реалистичное движение
        const movementLat = Math.sin(i * 0.02) * 0.002; // плавное движение
        const movementLng = Math.cos(i * 0.02) * 0.002;
        
        // GPS шум
        const noiseLat = (Math.random() - 0.5) * noiseLevel;
        const noiseLng = (Math.random() - 0.5) * noiseLevel;
        
        // Выбросы (каждые 20 точек)
        let outlierLat = 0;
        let outlierLng = 0;
        if (i % 20 === 0 && i > 0) {
            outlierLat = (Math.random() - 0.5) * 0.005; // ±2.5 км выброс
            outlierLng = (Math.random() - 0.5) * 0.005;
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

async function testAdaptiveAlgorithm() {
    console.log('🧪 Тестирование адаптивного алгоритма\n');
    
    const movementTypes = ['walking', 'scooter', 'car', 'train'];
    
    for (const movementType of movementTypes) {
        console.log(`\n🚶 Тестирование типа движения: ${movementType.toUpperCase()}`);
        console.log('='.repeat(50));
        
        // Генерируем данные для данного типа движения
        const originalPositions = generateMovementData(movementType, 200);
        console.log(`📊 Исходные данные: ${originalPositions.length} точек`);
        
        // Создаем процессор с адаптивным режимом
        const processor = new CoordinateProcessor({
            enableAdaptiveMode: true
        });
        
        // Обрабатываем координаты
        const result = processor.processCoordinates(originalPositions);
        
        // Выводим результаты
        console.log('\n🔍 Результаты анализа:');
        if (result.movementAnalysis) {
            const analysis = result.movementAnalysis;
            console.log(`   Тип движения: ${analysis.type}`);
            console.log(`   Уверенность: ${(analysis.confidence * 100).toFixed(1)}%`);
            console.log(`   Средняя скорость: ${analysis.avgSpeed.toFixed(1)} км/ч`);
            console.log(`   Максимальная скорость: ${analysis.maxSpeed.toFixed(1)} км/ч`);
        }
        
        console.log('\n📈 Статистика обработки:');
        console.log(`   Исходных точек: ${result.stats.originalCount}`);
        console.log(`   Обработанных точек: ${result.stats.processedCount}`);
        console.log(`   Сокращение: ${result.stats.reductionPercent}%`);
        console.log(`   Исходное расстояние: ${result.stats.originalDistance}м`);
        console.log(`   Обработанное расстояние: ${result.stats.processedDistance}м`);
        console.log(`   Изменение расстояния: ${result.stats.distanceChangePercent}%`);
        
        // Показываем первые несколько точек
        console.log('\n📍 Первые 3 исходных точки:');
        originalPositions.slice(0, 3).forEach((pos, i) => {
            console.log(`   ${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()}`);
        });
        
        console.log('\n📍 Первые 3 обработанных точки:');
        result.processedPositions.slice(0, 3).forEach((pos, i) => {
            console.log(`   ${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()} (${pos.originalCount} исходных)`);
        });
        
        console.log('\n' + '='.repeat(50));
    }
    
    // Тест с реальными данными (имитация)
    console.log('\n🎯 Тест с реальными данными (имитация электросамоката):');
    console.log('='.repeat(50));
    
    // Генерируем данные электросамоката с проблемами GPS
    const scooterData = generateMovementData('scooter', 300);
    
    // Добавляем проблемы с GPS в начале (глушение сигнала)
    for (let i = 0; i < 10; i++) {
        scooterData[i].coords[0] += (Math.random() - 0.5) * 0.01; // ±5 км отклонение
        scooterData[i].coords[1] += (Math.random() - 0.5) * 0.01;
    }
    
    const processor = new CoordinateProcessor({
        enableAdaptiveMode: true
    });
    
    const result = processor.processCoordinates(scooterData);
    
    console.log(`📊 Исходные данные: ${result.stats.originalCount} точек`);
    console.log(`🎯 Определенный тип: ${result.movementAnalysis?.type || 'unknown'}`);
    console.log(`📈 Обработанных точек: ${result.stats.processedCount} (сокращение на ${result.stats.reductionPercent}%)`);
    console.log(`📏 Расстояние: ${result.stats.originalDistance}м → ${result.stats.processedDistance}м`);
}

// Запускаем тест
testAdaptiveAlgorithm().catch(console.error); 