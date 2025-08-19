import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  alpha,
  useTheme,
  Grid,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import TaskCard from './TaskCard';
import TaskCategoryCard from './TaskCategoryCard';
import TelegramYandexMap from '../Map/TelegramYandexMap';

const TasksListView = ({
  tasks,
  expandedTasks,
  onTaskExpand,
  onAcceptAssigned,
  onTakeFree,
  onStartWork,
  onCompleteWork,
  hasTaskInProgress,
  inProgressTask,
  showMap,
  targetLocation,
  currentLocation,
  route,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('my'); // Set default to 'my'

  // Разделяем задачи по категориям
  const currentTask = tasks.assigned.find(task => task.status === 'in-progress');
  const myTasks = tasks.assigned.filter(task => task.status === 'assigned' || task.status === 'accepted');
  const freeTasks = tasks.free;
  const completedTasks = tasks.assigned.filter(task => task.status === 'completed');

  const renderTaskList = (tasksList, isAssigned = true) => (
    <Box>
      {tasksList.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isAssigned={isAssigned}
          isExpanded={expandedTasks.has(task.id)}
          onExpand={onTaskExpand}
          onAcceptAssigned={onAcceptAssigned}
          onTakeFree={onTakeFree}
          onStartWork={onStartWork}
          onCompleteWork={onCompleteWork}
          hasTaskInProgress={hasTaskInProgress}
          inProgressTask={inProgressTask}
          showMap={showMap}
          targetLocation={targetLocation}
          currentLocation={currentLocation}
          route={route}
        />
      ))}
    </Box>
  );

  const renderCategoryCards = () => (
    <Grid container spacing={4} sx={theme => ({
      mb: 4,
      ...(currentTask ? {} : {
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '600px',
        zIndex: 1,
      })
    })}>
      <Grid item xs={4}>
        <TaskCategoryCard
          title="Мои задачи"
          count={myTasks.length}
          onClick={() => setSelectedCategory('my')}
        />
      </Grid>
      <Grid item xs={4}>
        <TaskCategoryCard
          title="Свободные задачи"
          count={freeTasks.length}
          onClick={() => setSelectedCategory('free')}
        />
      </Grid>
      <Grid item xs={4}>
        <TaskCategoryCard
          title="Завершенные"
          count={completedTasks.length}
          onClick={() => setSelectedCategory('completed')}
        />
      </Grid>
    </Grid>
  );

  const renderSelectedCategory = () => {
    if (!selectedCategory) return null;

    let title, tasks, emptyMessage, isAssigned;

    switch (selectedCategory) {
      case 'free':
        title = 'Свободные задачи';
        tasks = freeTasks;
        emptyMessage = 'Нет доступных свободных задач';
        isAssigned = false;
        break;
      case 'my':
        title = 'Мои задачи';
        tasks = myTasks;
        emptyMessage = 'У вас нет назначенных задач';
        isAssigned = true;
        break;
      case 'completed':
        title = 'Завершенные задачи';
        tasks = completedTasks;
        emptyMessage = 'Нет завершенных задач';
        isAssigned = true;
        break;
      default:
        return null;
    }

    return (
      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 3,
            color: theme.palette.text.primary,
            fontWeight: 700,
            textAlign: 'center',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            letterSpacing: '-0.01em',
            position: 'relative',
            opacity: 0.9,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 3,
              borderRadius: '1.5px',
              background: `linear-gradient(90deg, ${alpha(theme.palette.secondary.main, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.5)} 100%)`,
            }
          }}
        >
          {title}
        </Typography>
        
        {tasks.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: '16px',
              background: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main
              }
            }}
          >
            {emptyMessage}
          </Alert>
        ) : (
          renderTaskList(tasks, isAssigned)
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ pb: '88px' }}>
      {/* Карта или текущая задача */}
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 3, 
            color: theme.palette.primary.main,
            fontWeight: 700,
            textAlign: 'center',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            letterSpacing: '-0.01em',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 3,
              borderRadius: '1.5px',
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)} 0%, ${alpha(theme.palette.secondary.main, 0.7)} 100%)`,
            }
          }}
        >
          {currentTask ? 'Текущая задача' : 'Ваше положение'}
        </Typography>

        {!currentTask ? (
          <Fade in={true} timeout={500}>
            <Box sx={{ position: 'relative' }}>
              {!currentLocation && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 2,
                    borderRadius: '16px',
                    background: alpha(theme.palette.info.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    '& .MuiAlert-icon': {
                      color: theme.palette.info.main
                    }
                  }}
                >
                  Вы не делитесь координатами
                </Alert>
              )}
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 4,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
              }}>
                <CardContent sx={{ p: 0, position: 'relative' }}>
                  <TelegramYandexMap 
                    points={[]}
                    center={currentLocation}
                    zoom={15}
                    height="600px"
                  />
                  {renderCategoryCards()}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ) : (
          <>
            <TaskCard
              key={currentTask.id}
              task={currentTask}
              isAssigned={true}
              isExpanded={expandedTasks.has(currentTask.id)}
              onExpand={onTaskExpand}
              onAcceptAssigned={onAcceptAssigned}
              onTakeFree={onTakeFree}
              onStartWork={onStartWork}
              onCompleteWork={onCompleteWork}
              hasTaskInProgress={hasTaskInProgress}
              inProgressTask={inProgressTask}
              showMap={showMap}
              targetLocation={targetLocation}
              currentLocation={currentLocation}
              route={route}
            />
            {renderCategoryCards()}
          </>
        )}
      </Box>

      {/* Отображение выбранной категории */}
      {renderSelectedCategory()}
    </Box>
  );
};

export default TasksListView; 