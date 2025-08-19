import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { toLocal, formatDate } from '../../utils/dateUtils';

const statusColors = {
  "not-assigned": 'default',
  assigned: 'info',
  accepted: 'info',
  inProgress: 'warning',
  completed: 'success',
  overdue: 'error',
  needsRevision: 'warning',
  done: 'success',
  cancelled: 'error',
};

const statusLabels = {
  "not-assigned": 'Не назначена',
  assigned: 'Назначено',
  accepted: 'Принято',
  inProgress: 'В работе',
  completed: 'Завершено',
  overdue: 'Просрочено',
  needsRevision: 'Требует доработки',
  done: 'Выполнено',
  cancelled: 'Отменено',
};

const TasksTable = ({ tasks, actionButtons }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Адрес</TableCell>
            <TableCell>Сотрудник</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Дата начала</TableCell>
            <TableCell>Дедлайн</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.address}</TableCell>
              <TableCell>
                {task.assigned_to ? (
                  <Box>
                    <Typography variant="body2" component="div">
                      {task.assigned_to_name}
                    </Typography>
                    {(task.assigned_to_username || task.assigned_to_email) && (
                      <Typography variant="caption" color="text.secondary" component="div">
                        {task.assigned_to_username ? `@${task.assigned_to_username}` : task.assigned_to_email}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  'Не назначен'
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={statusLabels[task.status]}
                  color={statusColors[task.status]}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {task.start_date
                  ? formatDate(toLocal(task.start_date))
                  : '-'}
              </TableCell>
              <TableCell>
                {task.end_date
                  ? formatDate(toLocal(task.end_date))
                  : '-'}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {actionButtons(task)}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TasksTable; 