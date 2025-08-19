import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { getTelegramUser } from '../../utils/telegram';
import { useAuthContext } from '../../context/AuthContext';

const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер',
  employee: 'Сотрудник',
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navValue, setNavValue] = useState('settings');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('SettingsPage: Starting profile fetch');
        console.log('SettingsPage: Auth context state:', { user, isAuthenticated });
        
        // Ждем аутентификации
        if (!isAuthenticated) {
          console.log('SettingsPage: Not authenticated yet, waiting...');
          setLoading(false);
          return;
        }
        
        // Get Telegram user data
        const telegramUser = getTelegramUser();
        console.log('SettingsPage: Telegram user:', telegramUser);
        
        if (!telegramUser) {
          throw new Error('Не удалось получить данные пользователя Telegram');
        }

        // Если у нас есть пользователь в контексте, используем его данные
        if (user && isAuthenticated) {
          console.log('SettingsPage: Using user data from context:', user);
          setProfile(user);
        } else {
          // Иначе пытаемся получить профиль через API
          console.log('SettingsPage: Fetching profile from API');
          const response = await api.auth.getProfile();
          console.log('SettingsPage: API response:', response);
          setProfile(response);
        }
      } catch (err) {
        console.error('SettingsPage: Failed to fetch profile:', err);
        setError('Не удалось загрузить профиль: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const handleNavChange = (event, newValue) => {
    setNavValue(newValue);
    switch (newValue) {
      case 'home':
        navigate('/my-app');
        break;
      case 'current':
        navigate('/my-app/current-task');
        break;
      case 'settings':
        navigate('/my-app/settings');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      <Container>
        <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 2 }}>
          Настройки
        </Typography>

        {profile && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {profile.full_name || 'Имя не указано'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {roleLabels[profile.role] || profile.role}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List>
                {profile.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={profile.email}
                    />
                  </ListItem>
                )}

                {profile.username && (
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Username"
                      secondary={`@${profile.username}`}
                    />
                  </ListItem>
                )}

                {profile.telegram_id && (
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Telegram ID"
                      secondary={profile.telegram_id}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Компания"
                    secondary={profile.company_id ? `ID: ${profile.company_id}` : 'Не привязана к компании'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <SupervisorIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Роль"
                    secondary={roleLabels[profile.role] || profile.role}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}
      </Container>

      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          borderTop: 1,
          borderColor: 'divider'
        }} 
        elevation={3}
      >
        <BottomNavigation value={navValue} onChange={handleNavChange}>
          <BottomNavigationAction
            label="Главная"
            value="home"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Текущая"
            value="current"
            icon={<PlayArrowIcon />}
          />
          <BottomNavigationAction
            label="Настройки"
            value="settings"
            icon={<SettingsIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default SettingsPage; 