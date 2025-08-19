import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsOutlined,
  Settings as SettingsIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { isTelegramWebApp } from '../../utils/telegram';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useThemeContext();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            marginRight: 2,
            display: { md: 'none' },
            color: 'text.primary',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              maxWidth: '180px', 
              height: 'auto',
              cursor: 'pointer'
            }} 
            onClick={() => window.location.href = '/dashboard/tasks'}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Кнопка переключения темы (скрыта в Telegram Web App) */}
          {!isTelegramWebApp() && (
            <IconButton
              size="large"
              aria-label="toggle theme"
              color="inherit"
              onClick={toggleTheme}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: 'background.subtle',
                  color: 'text.primary'
                }
              }}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          )}

          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            sx={{ color: 'text.secondary' }}
          >
            <NotificationsOutlined />
          </IconButton>

          <IconButton
            size="large"
            aria-label="settings"
            color="inherit"
            sx={{ color: 'text.secondary' }}
          >
            <SettingsIcon />
          </IconButton>

          <Button
            onClick={handleMenu}
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              '&:hover': { backgroundColor: 'background.subtle' },
            }}
            startIcon={
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'primary.main',
                }}
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            }
          >
            {user?.email || 'User'}
          </Button>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
              },
            }}
          >
            <MenuItem onClick={handleClose}>Профиль</MenuItem>
            <MenuItem onClick={handleClose}>Настройки</MenuItem>
            <MenuItem onClick={handleLogout}>Выйти</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 