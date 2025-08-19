# MyApp Components

Этот модуль содержит компоненты для мини-приложения Telegram, разделенные на логические части для лучшей организации кода.

## Структура

```
MyApp/
├── index.js                 # Экспорт всех компонентов
├── constants.js             # Константы (статусы, роли, лейблы)
├── utils.js                 # Утилиты для стилей
├── TaskCard.js              # Компонент карточки задачи
├── TasksListView.js         # Список всех задач
├── CurrentTaskView.js       # Представление текущей задачи
├── SettingsView.js          # Представление настроек
├── BottomNavigation.js      # Нижняя навигация
└── README.md               # Документация
```

## Компоненты

### TaskCard

Отображает отдельную задачу с возможностью раскрытия деталей и выполнения действий.

**Props:**

- `task` - объект задачи
- `isAssigned` - является ли задача назначенной
- `isExpanded` - раскрыта ли карточка
- `onExpand` - обработчик раскрытия
- `onAcceptAssigned` - обработчик принятия назначенной задачи
- `onTakeFree` - обработчик взятия свободной задачи
- `onStartWork` - обработчик начала работы
- `onCompleteWork` - обработчик завершения работы
- `hasTaskInProgress` - есть ли задача в работе
- `inProgressTask` - задача в работе
- `showMap` - показывать ли карту
- `targetLocation` - целевая локация
- `currentLocation` - текущая локация
- `route` - маршрут

### TasksListView

Отображает список всех задач (назначенные и свободные).

**Props:**

- `tasks` - объект с массивами assigned и free задач
- `expandedTasks` - Set с ID раскрытых задач
- Все обработчики из TaskCard
- Параметры карты

### CurrentTaskView

Отображает текущую активную задачу пользователя.

**Props:**

- `currentTask` - текущая задача
- `showMap` - показывать ли карту
- `targetLocation` - целевая локация
- `currentLocation` - текущая локация
- `route` - маршрут
- `onStartWork` - обработчик начала работы
- `onCompleteWork` - обработчик завершения работы

### SettingsView

Отображает профиль пользователя и настройки.

**Props:**

- `profile` - объект профиля пользователя

### BottomNavigationComponent

Нижняя навигация между разделами приложения.

**Props:**

- `currentView` - текущее представление
- `onNavChange` - обработчик смены представления

## Константы

### statusColors

Цвета для различных статусов задач.

### statusLabels

Лейблы для статусов задач на русском языке.

### roleLabels

Лейблы для ролей пользователей.

## Утилиты

### getStatusStyles(status, theme)

Возвращает стили для статуса задачи на основе темы Material-UI.

## Хук

### useMyApp(isAuthenticated, user)

Кастомный хук, содержащий всю логику состояния и обработчиков для MyApp.

**Возвращает:**

- Все состояния компонента
- Все обработчики событий
- Функции для работы с API

## Использование

```jsx
import {
  TasksListView,
  CurrentTaskView,
  SettingsView,
  BottomNavigationComponent,
} from "../../components/MyApp";

// В компоненте
const {
  currentView,
  tasks,
  // ... другие состояния
  handleNavChange,
  // ... другие обработчики
} = useMyApp(isAuthenticated, user);

return (
  <ViewTransition active={currentView === "home"}>
    <TasksListView
      tasks={tasks}
      // ... другие пропсы
    />
  </ViewTransition>
);
```
