/**
 * Тест обработки реальных координат
 */

const CoordinateProcessor = require('./utils/coordinateProcessor');

// Реальные данные из логов (495 точек)
const realCoordinates = [
  {
    latitude: 56.323717,
    longitude: 44.037224,
    timestamp: new Date('2025-08-13T10:00:13.545Z'),
    session_id: 20,
    session_start: new Date('2025-08-11T14:17:13.381Z'),
    session_end: null,
    task_id: 56,
    task_title: 'Купить алко',
    task_status: 'in-progress',
    route_type: 'task'
  }
  // ... остальные 494 точки
];

// Генерируем тестовые данные на основе реальных координат
function generateRealisticCoordinates() {
  const baseLat = 56.323717;
  const baseLng = 44.037224;
  const positions = [];
  
  // Генерируем 495 точек с реалистичными вариациями
  for (let i = 0; i < 495; i++) {
    const time = new Date('2025-08-11T14:17:13.381Z');
    time.setMinutes(time.getMinutes() + i * 2); // каждая точка через 2 минуты
    
    // Добавляем реалистичное движение (имитируем перемещение по городу)
    const movementLat = Math.sin(i * 0.01) * 0.001; // плавное движение по широте
    const movementLng = Math.cos(i * 0.01) * 0.001; // плавное движение по долготе
    
    // Добавляем GPS шум (случайные отклонения)
    const noiseLat = (Math.random() - 0.5) * 0.0001; // ±50 метров
    const noiseLng = (Math.random() - 0.5) * 0.0001;
    
    // Добавляем выбросы (каждые 50 точек)
    let outlierLat = 0;
    let outlierLng = 0;
    if (i % 50 === 0 && i > 0) {
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

async function testRealCoordinates() {
  console.log('🧪 Тестирование обработки реальных координат\n');
  
  // Генерируем реалистичные данные
  const originalPositions = generateRealisticCoordinates();
  console.log(`📊 Исходные данные: ${originalPositions.length} точек`);
  
  // Тестируем разные настройки процессора
  const testConfigs = [
    {
      name: 'Стандартные настройки',
      config: {
        maxSpeedKmh: 100,
        minSpeedKmh: 0.1,
        clusterRadiusMeters: 20,
        timeWindowMs: 30000,
        minPointsForMedian: 3
      }
    },
    {
      name: 'Строгая фильтрация',
      config: {
        maxSpeedKmh: 50,
        minSpeedKmh: 0.5,
        clusterRadiusMeters: 10,
        timeWindowMs: 15000,
        minPointsForMedian: 3
      }
    },
    {
      name: 'Мягкая фильтрация',
      config: {
        maxSpeedKmh: 200,
        minSpeedKmh: 0.05,
        clusterRadiusMeters: 50,
        timeWindowMs: 60000,
        minPointsForMedian: 2
      }
    }
  ];
  
  for (const testConfig of testConfigs) {
    console.log(`\n🔧 ${testConfig.name}:`);
    console.log('Настройки:', testConfig.config);
    
    const processor = new CoordinateProcessor(testConfig.config);
    const processedPositions = processor.processCoordinates(originalPositions);
    const stats = processor.getProcessingStats(originalPositions, processedPositions);
    
    console.log('Результат:', {
      originalCount: stats.originalCount,
      processedCount: stats.processedCount,
      reductionPercent: stats.reductionPercent + '%',
      originalDistance: Math.round(stats.originalDistance) + 'м',
      processedDistance: Math.round(stats.processedDistance) + 'м',
      distanceChangePercent: stats.distanceChangePercent + '%'
    });
    
    // Показываем первые несколько точек
    console.log('\n📍 Первые 5 исходных точек:');
    originalPositions.slice(0, 5).forEach((pos, i) => {
      console.log(`${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()}`);
    });
    
    console.log('\n📍 Первые 5 обработанных точек:');
    processedPositions.slice(0, 5).forEach((pos, i) => {
      console.log(`${i + 1}. [${pos.coords[0].toFixed(6)}, ${pos.coords[1].toFixed(6)}] - ${pos.timestamp.toISOString()} (${pos.originalCount} исходных)`);
    });
    
    console.log('\n' + '='.repeat(60));
  }
}

// Запускаем тест
testRealCoordinates().catch(console.error); 