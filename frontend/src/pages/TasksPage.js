import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import TasksTable from '../components/Tasks/TasksTable';
import TaskFormOffcanvas from '../components/Tasks/TaskFormOffcanvas';
import DeleteConfirmModal from '../components/Tasks/DeleteConfirmModal';
import { api } from '../utils/api';

const TasksPage = () => {
  console.log('TasksPage mounted');
  
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [error, setError] = useState(null);

  const handleAdd = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setShowDelete(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await api.tasks.update(editingTask.id, taskData);
      } else {
        await api.tasks.create(taskData);
      }
      
      // Refresh the task list
      await fetchTasks();
      
      // Close the form and reset editing state
      setShowForm(false);
      setEditingTask(null);
      setError(null);
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Не удалось сохранить задачу. Пожалуйста, попробуйте еще раз.');
      throw error; // Propagate error to form component
    }
  };

  const handleConfirmComplete = async (task) => {
    try {
      await api.tasks.updateStatus(task.id, 'done');
      fetchTasks(); // Перезагружаем список задач для получения обновленного статуса
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Не удалось завершить задачу. Пожалуйста, попробуйте еще раз.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const response = await api.tasks.getAll();
      console.log('Tasks fetched:', response);
      setTasks(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Не удалось загрузить задачи. Пожалуйста, попробуйте еще раз.');
      setTasks([]);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.tasks.delete(taskToDelete.id);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      setShowDelete(false);
      setTaskToDelete(null);
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Не удалось удалить задачу. Пожалуйста, попробуйте еще раз.');
    }
  };

  const renderContent = () => {
    if (tasks.length === 0) {
      return (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'background.subtle',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет добавленных задач
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Добавьте свою первую задачу, чтобы начать работу
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ px: 4 }}
          >
            Добавить задачу
          </Button>
        </Paper>
      );
    }

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', maxWidth: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
            Задачи
          </Typography>
        </Box>
        {error && (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        )}
        <TasksTable
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onComplete={handleConfirmComplete}
          actionButtons={(task) => (
            <>
              <Tooltip title="Редактировать">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(task)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {task.status === 'completed' && (
                <Tooltip title="Подтвердить выполнение">
                  <IconButton
                    size="small"
                    onClick={() => handleConfirmComplete(task)}
                    sx={{ color: 'success.main' }}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Удалить">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(task)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      </Paper>
    );
  };

  return (
    <Box sx={{ py: 3, px: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Задачи
        </Typography>
        {tasks.length > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Добавить
          </Button>
        )}
      </Box>

      {renderContent()}

      <TaskFormOffcanvas
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />

      <DeleteConfirmModal
        open={showDelete}
        onClose={() => {
          setShowDelete(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Удалить задачу?"
        content="Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить."
      />
    </Box>
  );
};

export default TasksPage; 