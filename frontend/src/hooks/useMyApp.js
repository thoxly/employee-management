import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { getTelegramUser, triggerHapticSelection, triggerHapticFeedback } from '../utils/telegram';

export const useMyApp = (isAuthenticated, user) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('home');
  const [tasks, setTasks] = useState({ assigned: [], free: [] });
  const [currentTask, setCurrentTask] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [showMap, setShowMap] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Состояния для имитации движения
  const [currentLocation, setCurrentLocation] = useState([55.751244, 37.618423]);
  const [targetLocation, setTargetLocation] = useState([55.751244, 37.618423]);
  const [route, setRoute] = useState([]);

  // Состояние для модального окна с инструкциями по локации
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState(null);
  const [hasTaskInProgress, setHasTaskInProgress] = useState(false);
  const [inProgressTask, setInProgressTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const telegramUser = getTelegramUser();
        if (!telegramUser) {
          throw new Error('Не удалось получить данные пользователя Telegram');
        }

        // Загружаем все данные параллельно
        const [tasksResponse, profileResponse] = await Promise.all([
          api.tasks.getForMiniApp(telegramUser.id),
          user && isAuthenticated ? Promise.resolve(user) : api.auth.getProfile()
        ]);

        setTasks(tasksResponse);
        setProfile(profileResponse);
        
        // Находим текущую задачу и проверяем наличие задачи в работе
        const inProgressTask = tasksResponse.assigned.find(task => task.status === 'in-progress');
        const acceptedTask = tasksResponse.assigned.find(task => task.status === 'accepted');
        const currentTaskToSet = inProgressTask || acceptedTask;
        setCurrentTask(currentTaskToSet || null);
        
        // Проверяем наличие задачи со статусом in-progress (которая блокирует взятие assigned задач)
        setHasTaskInProgress(!!inProgressTask);
        setInProgressTask(inProgressTask || null);
        
        // Если есть задача в работе, показываем карту
        if (inProgressTask) {
          console.log('🚀 Initial load - Setting showMap to true for in-progress task:', inProgressTask.id);
          setShowMap(true);
          // Устанавливаем начальные координаты для карты только если их еще нет
          if (!currentLocation || currentLocation.length !== 2 || !targetLocation || targetLocation.length !== 2) {
            const mockLocation = [55.751244 + Math.random() * 0.01, 37.618423 + Math.random() * 0.01];
            console.log('🚀 Initial load - Setting new mock location:', mockLocation);
            setTargetLocation(mockLocation);
            setCurrentLocation(mockLocation);
            setRoute([mockLocation]);
          } else {
            console.log('🚀 Initial load - Keeping existing location data');
          }
        }

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Обновляем задачи при изменении текущего представления
  useEffect(() => {
    if (currentView === 'home' && isAuthenticated) {
      refreshTasks();
    }
  }, [currentView, isAuthenticated]);

  // Эффект для имитации движения
  useEffect(() => {
    if (!showMap || currentTask?.status !== 'in-progress') return;

    const interval = setInterval(() => {
      const randomOffset = () => (Math.random() - 0.5) * 0.001;
      const newLocation = [
        targetLocation[0] + randomOffset(),
        targetLocation[1] + randomOffset(),
      ];
      setCurrentLocation(newLocation);
      setRoute(prev => [...prev, newLocation].slice(-20));
    }, 3000);

    return () => clearInterval(interval);
  }, [showMap, currentTask?.status, targetLocation]);

  const handleNavChange = (event, newValue) => {
    triggerHapticSelection();
    setCurrentView(newValue);
    switch (newValue) {
      case 'home':
        navigate('/my-app');
        break;
      case 'settings':
        navigate('/my-app/settings');
        break;
      default:
        break;
    }
  };

  const handleTaskExpand = (taskId) => {
    triggerHapticSelection();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAcceptAssigned = async (taskId, event) => {
    event.stopPropagation();
    try {
      triggerHapticFeedback('medium');
      const telegramUser = getTelegramUser();
      await api.tasks.acceptAssigned(taskId, telegramUser.id);
      
      // Обновляем список задач
      const response = await api.tasks.getForMiniApp(telegramUser.id);
      setTasks(response);
      
      // Обновляем состояние текущей задачи и карты
      const inProgressTask = response.assigned.find(task => task.status === 'in-progress');
      const acceptedTask = response.assigned.find(task => task.status === 'accepted');
      const currentTaskToSet = inProgressTask || acceptedTask;
      setCurrentTask(currentTaskToSet || null);
      
      setHasTaskInProgress(!!inProgressTask);
      setInProgressTask(inProgressTask || null);
      
      setSnackbar({
        open: true,
        message: 'Задача принята!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to accept task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Ошибка при принятии задачи',
        severity: 'error'
      });
    }
  };

  const handleTakeFree = async (taskId, event) => {
    event.stopPropagation();
    try {
      triggerHapticFeedback('medium');
      const telegramUser = getTelegramUser();
      
      await api.tasks.takeFree(taskId, telegramUser.id);
      
      // Обновляем список задач
      const response = await api.tasks.getForMiniApp(telegramUser.id);
      setTasks(response);
      
      // Обновляем состояние текущей задачи и карты
      const inProgressTask = response.assigned.find(task => task.status === 'in-progress');
      const acceptedTask = response.assigned.find(task => task.status === 'accepted');
      const currentTaskToSet = inProgressTask || acceptedTask;
      setCurrentTask(currentTaskToSet || null);
      
      setHasTaskInProgress(!!inProgressTask);
      setInProgressTask(inProgressTask || null);
      
      setSnackbar({
        open: true,
        message: 'Задача взята!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to take task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Ошибка при взятии задачи',
        severity: 'error'
      });
    }
  };

  const handleStartWork = async (taskId, event) => {
    event.stopPropagation();
    try {
      triggerHapticFeedback('medium');
      const telegramUser = getTelegramUser();
      
      console.log('🎯 handleStartWork - Starting work for task:', taskId);
      
      // Имитация получения координат
      const mockLocation = [55.751244 + Math.random() * 0.01, 37.618423 + Math.random() * 0.01];
      console.log('🎯 handleStartWork - Setting mock location:', mockLocation);
      setTargetLocation(mockLocation);
      setCurrentLocation(mockLocation);
      setRoute([mockLocation]);
      setShowMap(true);
      
      // Обновляем статус задачи
      await api.tasks.startWork(taskId, telegramUser.id);
      
      // Обновляем список задач
      const response = await api.tasks.getForMiniApp(telegramUser.id);
      setTasks(response);
      setHasTaskInProgress(true);
      
      // Обновляем текущую задачу
      const updatedTask = response.assigned.find(task => task.id === taskId);
      if (updatedTask) {
        setCurrentTask(updatedTask);
        console.log('🎯 handleStartWork - Updated current task:', updatedTask.id, updatedTask.status);
      }
      
      setSnackbar({
        open: true,
        message: 'Работа начата!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to start work:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Ошибка при начале работы',
        severity: 'error'
      });
    }
  };

  const handleCompleteWork = async (taskId, event) => {
    event.stopPropagation();
    try {
      triggerHapticFeedback('medium');
      const telegramUser = getTelegramUser();
      
      // Обновляем статус задачи
      await api.tasks.updateStatus(taskId, 'completed', telegramUser.id);
      
      // Сбрасываем состояния карты
      setShowMap(false);
      setRoute([]);
      
      // Обновляем список задач
      const response = await api.tasks.getForMiniApp(telegramUser.id);
      setTasks(response);
      setHasTaskInProgress(false);
      
      // Обновляем текущую задачу
      const updatedTask = response.assigned.find(task => task.id === taskId);
      if (updatedTask) {
        setCurrentTask(updatedTask);
      } else {
        // Если задача завершена, убираем её из текущих
        setCurrentTask(null);
      }
      
      setSnackbar({
        open: true,
        message: 'Задача успешно завершена!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to complete task:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Ошибка при завершении задачи',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const refreshTasks = async () => {
    try {
      const telegramUser = getTelegramUser();
      const tasksResponse = await api.tasks.getForMiniApp(telegramUser.id);
      setTasks(tasksResponse);
      
      // Обновляем текущую задачу - приоритет задачам в работе
      const inProgressTask = tasksResponse.assigned.find(task => task.status === 'in-progress');
      const acceptedTask = tasksResponse.assigned.find(task => task.status === 'accepted');
      const currentTaskToSet = inProgressTask || acceptedTask;
      setCurrentTask(currentTaskToSet || null);
      
      // Проверяем наличие задачи со статусом in-progress (которая блокирует взятие assigned задач)
      setHasTaskInProgress(!!inProgressTask);
      setInProgressTask(inProgressTask || null);
      
      // Сохраняем текущее состояние карты
      const wasMapVisible = showMap;
      const hadCurrentLocation = currentLocation && currentLocation.length === 2;
      const hadTargetLocation = targetLocation && targetLocation.length === 2;
      const hadRoute = route && route.length > 0;
      
      console.log('🔍 refreshTasks - Debug:', {
        inProgressTask: inProgressTask?.id,
        inProgressTaskStatus: inProgressTask?.status,
        wasMapVisible,
        hadCurrentLocation,
        hadTargetLocation,
        hadRoute,
        showMap
      });
      
      // Если есть задача в работе, показываем карту
      if (inProgressTask) {
        console.log('✅ Setting showMap to true for in-progress task:', inProgressTask.id);
        setShowMap(true);
        // Устанавливаем начальные координаты для карты только если их еще нет
        if (!hadCurrentLocation || !hadTargetLocation) {
          const mockLocation = [55.751244 + Math.random() * 0.01, 37.618423 + Math.random() * 0.01];
          console.log('📍 Setting new mock location:', mockLocation);
          setTargetLocation(mockLocation);
          setCurrentLocation(mockLocation);
          setRoute([mockLocation]);
        } else {
          console.log('📍 Keeping existing location data');
        }
      } else {
        // Если нет задачи в работе, скрываем карту
        console.log('❌ Setting showMap to false - no in-progress task');
        setShowMap(false);
        setRoute([]);
      }
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  };

  const handleLocationModalClose = () => {
    setLocationModalOpen(false);
    setPendingTaskId(null);
  };

  const handleLocationModalRetry = async () => {
    if (!pendingTaskId) return;
    
    try {
      const telegramUser = getTelegramUser();
      
      // Проверяем активную сессию (локацию) снова
      const sessionResponse = await api.sessions.getActiveSession(telegramUser.id);
      
      if (!sessionResponse.hasActiveSession) {
        setError('Геолокация все еще не включена. Пожалуйста, следуйте инструкциям.');
        return;
      }
      
      // Начинаем работу с проверкой локации
      await api.tasks.startWork(pendingTaskId, telegramUser.id);
      
      // Обновляем локальное состояние
      setCurrentTask(prev => prev ? { ...prev, status: 'in-progress' } : null);
      setTasks(prev => prev.map(task => 
        task.id === pendingTaskId ? { ...task, status: 'in-progress' } : task
      ));
      
      setLocationModalOpen(false);
      setPendingTaskId(null);
      
    } catch (err) {
      console.error('Failed to start work on retry:', err);
      
      if (err.message && err.message.includes('локацией')) {
        setError('Геолокация все еще не включена. Пожалуйста, следуйте инструкциям.');
      } else {
        setError(err.message || 'Не удалось обновить статус задачи');
      }
    }
  };

  return {
    // State
    currentView,
    tasks,
    currentTask,
    profile,
    loading,
    error,
    expandedTasks,
    showMap,
    snackbar,
    currentLocation,
    targetLocation,
    route,
    locationModalOpen,
    pendingTaskId,
    hasTaskInProgress,
    inProgressTask,
    
    // Handlers
    handleNavChange,
    handleTaskExpand,
    handleAcceptAssigned,
    handleTakeFree,
    handleStartWork,
    handleCompleteWork,
    handleCloseSnackbar,
    handleLocationModalClose,
    handleLocationModalRetry,
    refreshTasks,
  };
}; 