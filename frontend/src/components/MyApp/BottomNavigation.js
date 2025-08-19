import React from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { BOTTOM_NAV_HEIGHT } from './constants';

const BottomNavigationComponent = ({ currentView, onNavChange }) => {
  const theme = useTheme();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: '24px 24px 0 0',
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(20px)',
        boxShadow: `0 -5px 20px -5px ${alpha(theme.palette.common.black, 0.1)}`,
        zIndex: 1200,  // Увеличиваем z-index
      }} 
      elevation={0}
    >
      <BottomNavigation 
        value={currentView} 
        onChange={onNavChange}
        sx={{
          height: BOTTOM_NAV_HEIGHT,
          background: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '8px 12px',
            color: alpha(theme.palette.text.primary, 0.6),
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out'
              }
            }
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'font-size 0.2s ease-in-out',
            '&.Mui-selected': {
              fontSize: '0.825rem'
            }
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        <BottomNavigationAction
          label="Главная"
          value="home"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Настройки"
          value="settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavigationComponent; 