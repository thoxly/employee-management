import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Badge,
  alpha,
  useTheme,
} from '@mui/material';

const TaskCategoryCard = ({ title, count, onClick }) => {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Badge
        badgeContent={count}
        color="primary"
        sx={{
          width: '100%',
          height: '100%',
          '& .MuiBadge-badge': {
            fontSize: '0.875rem',
            height: '24px',
            minWidth: '24px',
            borderRadius: '12px',
            fontWeight: 600,
            right: 3,
            top: 2,
          }
        }}
      >
        <Paper
          onClick={onClick}
          sx={{
            cursor: 'pointer',
            p: 2.5,
            borderRadius: 4,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px -4px ${alpha(theme.palette.common.black, 0.1)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 48px -8px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          }}
        >
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 500,
              textAlign: 'center',
              fontSize: { xs: '1rem', sm: '1.125rem' },
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
        </Paper>
      </Badge>
    </Box>
  );
};

export default TaskCategoryCard; 