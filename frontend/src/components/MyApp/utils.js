import { alpha } from '@mui/material/styles';

export const getStatusStyles = (status, theme) => {
  const colorMap = {
    assigned: {
      bg: alpha(theme.palette.info.main, 0.12),
      color: theme.palette.info.dark,
      border: alpha(theme.palette.info.main, 0.24)
    },
    accepted: {
      bg: alpha(theme.palette.secondary.main, 0.12),
      color: theme.palette.secondary.dark,
      border: alpha(theme.palette.secondary.main, 0.24)
    },
    'in-progress': {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.24)
    },
    completed: {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.24)
    },
    done: {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.dark,
      border: alpha(theme.palette.success.main, 0.24)
    },
    cancelled: {
      bg: alpha(theme.palette.error.main, 0.12),
      color: theme.palette.error.dark,
      border: alpha(theme.palette.error.main, 0.24)
    },
    needsRevision: {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.dark,
      border: alpha(theme.palette.warning.main, 0.24)
    },
    'not-assigned': {
      bg: alpha(theme.palette.grey[500], 0.12),
      color: theme.palette.grey[700],
      border: alpha(theme.palette.grey[500], 0.24)
    }
  };

  return colorMap[status] || colorMap['not-assigned'];
}; 