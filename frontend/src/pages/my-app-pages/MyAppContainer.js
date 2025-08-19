import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Container,
  Snackbar,
  alpha,
  useTheme,
} from '@mui/material';
import ViewTransition from '../../components/ViewTransition';
import {
  TasksListView,
  SettingsView,
  BottomNavigationComponent,
} from '../../components/MyApp';
import LocationInstructionModal from '../../components/LocationInstructionModal';
import { useAuthContext } from '../../context/AuthContext';
import { useMyApp } from '../../hooks/useMyApp';

const MyAppContainer = () => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthContext();
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  useEffect(() => {
    // Get initial viewport height
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setViewportHeight(tg.viewportHeight || window.innerHeight);
    }

    // Update viewport height on resize
    const handleResize = () => {
      if (window.Telegram?.WebApp) {
        setViewportHeight(window.Telegram.WebApp.viewportHeight || window.innerHeight);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
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
  } = useMyApp(isAuthenticated, user);

  console.log('🏠 MyAppContainer - State:', {
    currentView,
    currentTaskId: currentTask?.id,
    currentTaskStatus: currentTask?.status,
    showMap,
    hasTaskInProgress,
    inProgressTaskId: inProgressTask?.id,
    hasCurrentLocation: !!currentLocation,
    hasTargetLocation: !!targetLocation,
    hasRoute: !!route,
    tasksCount: {
      assigned: tasks.assigned?.length || 0,
      free: tasks.free?.length || 0
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        height: `${viewportHeight}px`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: alpha(theme.palette.background.default, 0.5),
      }}
    >
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
        }}
      >
        <Box sx={{ pb: '88px' }}> {/* Контейнер с отступом для скролла */}
          <ViewTransition active={currentView === 'home'} direction="slide">
            <TasksListView
              tasks={tasks}
              expandedTasks={expandedTasks}
              onTaskExpand={handleTaskExpand}
              onAcceptAssigned={handleAcceptAssigned}
              onTakeFree={handleTakeFree}
              onStartWork={handleStartWork}
              onCompleteWork={handleCompleteWork}
              hasTaskInProgress={hasTaskInProgress}
              inProgressTask={inProgressTask}
              showMap={showMap}
              targetLocation={targetLocation}
              currentLocation={currentLocation}
              route={route}
            />
          </ViewTransition>

          <ViewTransition active={currentView === 'settings'} direction="slide">
            <SettingsView profile={profile} />
          </ViewTransition>
        </Box>
      </Box>

      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        <BottomNavigationComponent
          currentView={currentView}
          onNavChange={handleNavChange}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          mb: '72px',
          '& .MuiAlert-root': {
            width: '100%'
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            fontWeight: 500,
            boxShadow: `0 8px 32px -4px ${alpha(theme.palette.common.black, 0.1)}`,
            border: `1px solid ${alpha(theme.palette[snackbar.severity].main, 0.2)}`
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <LocationInstructionModal
        open={locationModalOpen}
        onClose={handleLocationModalClose}
        onRetry={handleLocationModalRetry}
      />
    </Box>
  );
};

export default MyAppContainer; 