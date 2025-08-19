import React, { useState } from 'react';
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
} from '@mui/icons-material';
import LocationsTable from '../components/Locations/LocationsTable';
import LocationFormOffcanvas from '../components/Locations/LocationFormOffcanvas';
import DeleteConfirmModal from '../components/Locations/DeleteConfirmModal';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const handleAdd = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDelete = (location) => {
    setLocationToDelete(location);
    setShowDelete(true);
  };

  const handleFormSubmit = (location) => {
    if (editingLocation) {
      setLocations(locations.map((l) => (l.id === location.id ? location : l)));
    } else {
      setLocations([...locations, { ...location, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const handleDeleteConfirm = () => {
    setLocations(locations.filter((l) => l.id !== locationToDelete.id));
    setShowDelete(false);
  };

  const renderContent = () => {
    if (locations.length === 0) {
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
            Нет добавленных локаций
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Добавьте свою первую локацию, чтобы начать работу
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ px: 4 }}
          >
            Добавить локацию
          </Button>
        </Paper>
      );
    }

    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', maxWidth: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
            Локации
          </Typography>
        </Box>
        <LocationsTable
          locations={locations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actionButtons={(location) => (
            <>
              <Tooltip title="Редактировать">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(location)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(location)}
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
          Мои локации
        </Typography>
        {locations.length > 0 && (
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

      <LocationFormOffcanvas
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLocation}
      />
      
      <DeleteConfirmModal
        show={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        location={locationToDelete}
      />
    </Box>
  );
};

export default LocationsPage;