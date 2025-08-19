import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Alert,
  alpha,
  useTheme,
  Fade,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import TelegramYandexMap from '../Map/TelegramYandexMap';
import { formatDate } from '../../utils/dateUtils';

import { statusColors, statusLabels } from './constants';

const CurrentTaskView = ({
  currentTask,
  showMap,
  targetLocation,
  currentLocation,
  route,
  onStartWork,
  onCompleteWork,
}) => {
  const theme = useTheme();
  
  console.log('🗺️ CurrentTaskView - Props:', {
    currentTaskId: currentTask?.id,
    currentTaskStatus: currentTask?.status,
    showMap,
    hasTargetLocation: !!targetLocation,
    hasCurrentLocation: !!currentLocation,
    hasRoute: !!route,
    targetLocation,
    currentLocation,
    shouldShowCompleteButton: currentTask?.status === 'in-progress'
  });

  return (
    <Box sx={{ pb: '88px' }}>
      <Container maxWidth="md">
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mt: 4, 
            mb: 4,
            fontWeight: 800,
            textAlign: 'center',
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          {currentTask ? 'Текущая задача' : 'Ваше положение'}
        </Typography>

        <Fade in={true} timeout={500}>
          <Box>
            {currentTask ? (
              <Card sx={{ 
                mb: 2, 
                borderRadius: 3, 
                boxShadow: 4,
                transition: 'all 0.3s ease-in-out',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {currentTask.title}
                    </Typography>
                    <Chip 
                      label={statusLabels[currentTask.status]} 
                      color={statusColors[currentTask.status]}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                  </Box>
                  
                  <Typography color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                    {currentTask.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {currentTask.company_address || currentTask.company?.name || 'Адрес не указан'}
                      </Typography>
                    </Box>
                    {currentTask.deadline && (
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(currentTask.deadline)}
                      </Typography>
                    )}
                  </Box>

                  {currentTask.status === 'accepted' && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={(e) => onStartWork(currentTask.id, e)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          }
                        }}
                      >
                        Начать работу
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ) : !currentLocation && (
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

            <Fade in={true} timeout={800}>
              <Card sx={{ 
                mb: 2, 
                borderRadius: 3, 
                boxShadow: 4,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
              }}>
                <CardContent sx={{ p: 0 }}>
                  <TelegramYandexMap 
                    points={targetLocation ? [
                      { 
                        coordinates: targetLocation,
                        description: currentTask?.company_address || currentTask?.company?.name
                      }
                    ] : []}
                    center={currentLocation}
                    route={route}
                    zoom={15}
                    height="400px"
                  />
                </CardContent>
              </Card>
            </Fade>

            {currentTask?.status === 'in-progress' && (
              <Box sx={{ px: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={(e) => onCompleteWork(currentTask.id, e)}
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
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default CurrentTaskView; 