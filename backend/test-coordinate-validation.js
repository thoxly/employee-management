/**
 * Тестовый скрипт для проверки системы валидации координат
 * Проверяет различные сценарии подмены GPS
 */

const CoordinateValidator = require('./utils/coordinateValidator');
const CoordinateProcessor = require('./utils/coordinateProcessor');

// Тестовые данные
const testScenarios = {
    // Сценарий 1: Нормальные координаты рядом с ожидаемым местом
    normal: {
        name: "Нормальная работа",
        expectedCoords: [55.7558, 37.6173], // Красная площадь
        positions: [
            { coords: [55.7560, 37.6175], timestamp: new Date('2024-01-01T10:00:00Z') },
            { coords: [55.7559, 37.6174], timestamp: new Date('2024-01-01T10:01:00Z') },
            { coords: [55.7558, 37.6173], timestamp: new Date('2024-01-01T10:02:00Z') },
            { coords: [55.7557, 37.6172], timestamp: new Date('2024-01-01T10:03:00Z') }
        ]
    },

    // Сценарий 2: Координаты в другом городе (явная подделка)
    teleportation: {
        name: "Телепортация в другой город",
        expectedCoords: [55.7558, 37.6173], // Москва
        positions: [
            { coords: [55.7560, 37.6175], timestamp: new Date('2024-01-01T10:00:00Z') },
            { coords: [59.9311, 30.3609], timestamp: new Date('2024-01-01T10:01:00Z') }, // Питер
            { coords: [55.7558, 37.6173], timestamp: new Date('2024-01-01T10:02:00Z') }
        ]
    },

    // Сценарий 3: Постоянный сдвиг (глушилка)
    consistentShift: {
        name: "Постоянный сдвиг координат (глушилка)",
        expectedCoords: [55.7558, 37.6173], // Ожидаемое место
        positions: [
            { coords: [55.7658, 37.6273], timestamp: new Date('2024-01-01T10:00:00Z') }, // +0.01, +0.01
            { coords: [55.7659, 37.6274], timestamp: new Date('2024-01-01T10:01:00Z') }, // +0.01, +0.01
            { coords: [55.7657, 37.6272], timestamp: new Date('2024-01-01T10:02:00Z') }, // +0.01, +0.01
            { coords: [55.7658, 37.6273], timestamp: new Date('2024-01-01T10:03:00Z') }  // +0.01, +0.01
        ]
    },

    // Сценарий 4: Подозрительно точные координаты
    suspiciousAccuracy: {
        name: "Подозрительно точные координаты",
        expectedCoords: [55.7558, 37.6173],
        positions: [
            { coords: [55.7560000000, 37.6175000000], timestamp: new Date('2024-01-01T10:00:00Z') },
            { coords: [55.7550000000, 37.6170000000], timestamp: new Date('2024-01-01T10:01:00Z') },
            { coords: [55.7558000000, 37.6173000000], timestamp: new Date('2024-01-01T10:02:00Z') }
        ]
    },

    // Сценарий 5: Движение по прямой линии (нереалистично в городе)
    straightLine: {
        name: "Движение строго по прямой линии",
        expectedCoords: [55.7558, 37.6173],
        positions: [
            { coords: [55.7550, 37.6170], timestamp: new Date('2024-01-01T10:00:00Z') },
            { coords: [55.7552, 37.6171], timestamp: new Date('2024-01-01T10:01:00Z') },
            { coords: [55.7554, 37.6172], timestamp: new Date('2024-01-01T10:02:00Z') },
            { coords: [55.7556, 37.6173], timestamp: new Date('2024-01-01T10:03:00Z') },
            { coords: [55.7558, 37.6174], timestamp: new Date('2024-01-01T10:04:00Z') }
        ]
    }
};

async function runValidationTests() {
    console.log('🧪 Запуск тестов валидации координат...\n');

    const validator = new CoordinateValidator({
        maxAllowedDeviationKm: 2.0, // 2 км максимальное отклонение
        consistentShiftThreshold: 0.005, // ~500м порог для постоянного сдвига
        suspiciousAccuracyThreshold: 0.00001,
        teleportationMultiplier: 2
    });

    for (const [scenarioKey, scenario] of Object.entries(testScenarios)) {
        console.log(`📋 Тест: ${scenario.name}`);
        console.log(`   Ожидаемые координаты: [${scenario.expectedCoords.join(', ')}]`);
        
        let previousPositions = [];
        
        for (let i = 0; i < scenario.positions.length; i++) {
            const position = scenario.positions[i];
            
            const context = {
                expectedCoords: scenario.expectedCoords,
                previousPositions: previousPositions.slice(-5),
                lastPosition: previousPositions.length > 0 ? previousPositions[previousPositions.length - 1] : null,
                timeDiff: previousPositions.length > 0 ? 
                    Math.abs(position.timestamp - previousPositions[previousPositions.length - 1].timestamp) : null,
                maxSpeedKmh: 60,
                recentPositions: scenario.positions.slice(0, i)
            };

            const validation = validator.validateCoordinates(position.coords, context);
            const actions = validator.getRecommendedActions(validation);

            console.log(`   🔍 Позиция ${i + 1}: [${position.coords.join(', ')}]`);
            console.log(`      ⚡ Риск: ${validation.riskLevel}`);
            console.log(`      ⚠️  Предупреждения: ${validation.warnings.join(', ') || 'нет'}`);
            console.log(`      ✅ Действие: ${actions.accept ? 'принято' : 'отклонено'}${actions.flagForReview ? ' (помечено для проверки)' : ''}`);
            console.log(`      📝 Сообщение: ${actions.message}`);

            if (validation.details && validation.details.deviation) {
                console.log(`      📏 Отклонение: ${validation.details.deviation.distance.toFixed(2)} км`);
            }

            if (validation.details && validation.details.consistentShift) {
                const shift = validation.details.consistentShift;
                if (shift.isConsistent) {
                    console.log(`      🔄 Постоянный сдвиг: ${shift.avgShiftKm.toFixed(2)} км (уверенность: ${(shift.confidence * 100).toFixed(1)}%)`);
                }
            }

            if (validation.details && validation.details.teleportation) {
                const teleport = validation.details.teleportation;
                if (teleport.isTeleportation) {
                    console.log(`      🚁 Телепортация: ${teleport.distance.toFixed(2)} км за ${teleport.timeDiffHours.toFixed(2)} ч (скорость: ${teleport.actualSpeed.toFixed(1)} км/ч)`);
                }
            }

            if (actions.accept) {
                previousPositions.push(position);
            }

            console.log('');
        }

        console.log('─'.repeat(80));
        console.log('');
    }
}

async function runProcessorTests() {
    console.log('🔧 Тестирование интегрированного CoordinateProcessor...\n');

    const processor = new CoordinateProcessor({
        enableValidation: true,
        enableAdaptiveMode: true,
        maxAllowedDeviationKm: 2.0
    });

    // Тест с валидацией
    const testPositions = testScenarios.consistentShift.positions;
    const validationContext = {
        expectedCoords: testScenarios.consistentShift.expectedCoords,
        maxAllowedDeviationKm: 2.0
    };

    console.log('📊 Обработка координат с валидацией...');
    const result = processor.processCoordinates(testPositions, validationContext);

    console.log(`✅ Результат обработки:`);
    console.log(`   Исходных позиций: ${testPositions.length}`);
    console.log(`   Обработанных позиций: ${result.processedPositions.length}`);
    
    if (result.validationSummary) {
        const stats = result.validationSummary.stats;
        console.log(`   📈 Статистика валидации:`);
        console.log(`      - Принято: ${stats.accepted}`);
        console.log(`      - Помечено: ${stats.flagged}`);
        console.log(`      - Отклонено: ${stats.rejected}`);
        console.log(`      - Итого: ${stats.total}`);

        if (result.validationSummary.highRiskPositions.length > 0) {
            console.log(`   🚨 Позиции высокого риска: ${result.validationSummary.highRiskPositions.length}`);
        }

        if (result.validationSummary.flaggedPositions.length > 0) {
            console.log(`   ⚠️  Помеченные позиции: ${result.validationSummary.flaggedPositions.length}`);
        }
    }

    if (result.movementAnalysis) {
        console.log(`   🎯 Тип движения: ${result.movementAnalysis.type} (уверенность: ${(result.movementAnalysis.confidence * 100).toFixed(1)}%)`);
    }

    console.log('');
}

// Запуск тестов
async function main() {
    console.log('🚀 Система валидации координат - Тестирование');
    console.log('='.repeat(80));
    console.log('');

    try {
        await runValidationTests();
        await runProcessorTests();
        
        console.log('✅ Все тесты завершены успешно!');
    } catch (error) {
        console.error('❌ Ошибка при выполнении тестов:', error);
    }
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
    main();
}

module.exports = { runValidationTests, runProcessorTests }; 