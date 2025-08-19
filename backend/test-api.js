const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/employees';

async function testEmployeesAPI() {
  console.log('🧪 Тестирование API сотрудников...\n');

  try {
    // Тест 1: Генерация инвайт-кода
    console.log('1. Генерация инвайт-кода...');
    const generateResponse = await fetch(`${BASE_URL}/generate-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Инвайт-код сгенерирован:', generateData.invite_code);
      
      // Тест 2: Создание приглашения
      console.log('\n2. Создание приглашения...');
      const inviteResponse = await fetch(`${BASE_URL}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test_user',
          invite_code: generateData.invite_code,
        }),
      });

      if (inviteResponse.ok) {
        const inviteData = await inviteResponse.json();
        console.log('✅ Приглашение создано:', inviteData.message);
        console.log('   Сотрудник ID:', inviteData.employee.id);
      } else {
        const errorData = await inviteResponse.json();
        console.log('❌ Ошибка создания приглашения:', errorData.message);
      }

      // Тест 3: Получение списка сотрудников
      console.log('\n3. Получение списка сотрудников...');
      const listResponse = await fetch(`${BASE_URL}/`);

      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('✅ Список сотрудников получен');
        console.log('   Количество сотрудников:', listData.employees.length);
        
        if (listData.employees.length > 0) {
          console.log('   Последний сотрудник:', listData.employees[0].username);
        }
      } else {
        console.log('❌ Ошибка получения списка сотрудников');
      }

    } else {
      console.log('❌ Ошибка генерации инвайт-кода');
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

// Запуск тестов
testEmployeesAPI(); 