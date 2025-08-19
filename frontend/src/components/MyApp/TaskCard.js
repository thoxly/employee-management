import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Collapse,
  Divider,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import TelegramYandexMap from '../Map/TelegramYandexMap';
import { formatDate } from '../../utils/dateUtils';

import { statusColors, statusLabels } from './constants';
import { getStatusStyles } from './utils';

const TaskCard = ({
  task,
  isAssigned = false,
  isExpanded,
  onExpand,
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
  const statusStyle = getStatusStyles(task.status, theme);
  
  // Логируем только для задач в работе
  if (task.status === 'in-progress') {
    console.log('📋 TaskCard - In-progress task:', {
      taskId: task.id,
      showMap,
      hasTargetLocation: !!targetLocation,
      hasCurrentLocation: !!currentLocation,
      hasRoute: !!route,
      targetLocation,
      currentLocation
    });
  }
  
  // Определяем, должна ли карточка быть неактивной
  const isDisabled = hasTaskInProgress && (task.status === 'assigned' || task.status === 'accepted');

  const handleCardClick = () => {
    if (isDisabled && task.status !== 'assigned') {
      return;
    } else if (task.status === 'assigned') {
      return;
    } else if (task.status === 'accepted' && hasTaskInProgress) {
      return;
    } else {
      onExpand(task.id);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 3.5,
        borderRadius: '20px',
        boxShadow: isExpanded 
          ? `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`
          : `0 4px 20px -5px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isDisabled 
          ? alpha(theme.palette.grey[100], 0.5)
          : isExpanded 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
            : theme.palette.background.paper,
        border: isExpanded 
          ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` 
          : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-4px)',
          boxShadow: isDisabled 
            ? `0 4px 20px -5px ${alpha(theme.palette.common.black, 0.1)}`
            : `0 12px 40px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
        opacity: isDisabled ? 0.6 : 1,
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Заголовок и статус */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flex: 1, 
              mr: 2,
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '-0.01em',
              color: theme.palette.text.primary,
              lineHeight: 1.3
            }}
          >
            {task.title}
          </Typography>
          <Chip 
            label={statusLabels[task.status]} 
            sx={{ 
              fontWeight: 600,
              borderRadius: '12px',
              height: '28px',
              backgroundColor: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.75rem'
              }
            }}
          />
        </Box>

        {/* Основная информация */}
        <Box sx={{ mb: 2, px: 0.5 }}>
          <Box display="flex" alignItems="center" mb={1.5}>
            <LocationIcon sx={{ mr: 1.5, fontSize: 18, color: theme.palette.primary.main }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {task.company_address || task.company?.name || 'Адрес не указан'}
            </Typography>
          </Box>
          
          {task.deadline && (
            <Box display="flex" alignItems="center" mb={1.5}>
              <ScheduleIcon sx={{ mr: 1.5, fontSize: 18, color: theme.palette.error.main }} />
              <Typography variant="body2" color="text.secondary">
                Дедлайн: {formatDate(task.deadline)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Раскрывающиеся детали - только для задач не в статусе assigned */}
        {task.status !== 'assigned' && (
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                Полное описание:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {task.description}
              </Typography>
            </Box>

            {task.company?.name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Компания:
                </Typography>
                <Box display="flex" alignItems="center">
                  <BusinessIcon sx={{ mr: 1.5, fontSize: 18, color: theme.palette.primary.main }} />
                  <Typography variant="body2" color="text.secondary">
                    {task.company.name}
                  </Typography>
                </Box>
              </Box>
            )}
          </Collapse>
        )}

        {/* Кнопки действий */}
        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          {isAssigned ? (
            task.status === 'assigned' ? (
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => onAcceptAssigned(task.id, e)}
                sx={{ 
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Ознакомлен
              </Button>
            ) : task.status === 'accepted' ? (
              hasTaskInProgress ? (
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '12px',
                  background: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  width: '100%'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Можно будет принять в работу после выполнения текущей задачи: 
                    <Box component="span" sx={{ fontWeight: 700, color: theme.palette.warning.main, ml: 1 }}>
                      {inProgressTask?.title || 'Текущая задача'}
                    </Box>
                  </Typography>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={(e) => onStartWork(task.id, e)}
                  sx={{ 
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                  }}
                >
                  Начать работу
                </Button>
              )
            ) : task.status === 'in-progress' ? null : null
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={(e) => onTakeFree(task.id, e)}
              sx={{ 
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              }}
            >
              Взять задачу
            </Button>
          )}
        </Box>

        {task.status === 'in-progress' && (
          <Fade in={showMap} timeout={800}>
            <Box sx={{ mt: 3 }}>
              <TelegramYandexMap 
                points={[{ 
                  coordinates: targetLocation,
                  description: task.company_address || task.company?.name
                }]}
                center={currentLocation}
                route={route}
                zoom={15}
                height="300px"
              />
            </Box>
          </Fade>
        )}

        {task.status === 'in-progress' && (
          <Box sx={{ mt: 3, px: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={(e) => onCompleteWork(task.id, e)}
              fullWidth
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                py: 2,
                fontSize: '1.1rem',
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px -5px ${alpha(theme.palette.success.main, 0.4)}`,
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: `0 4px 15px -3px ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              Завершить задачу
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard; 