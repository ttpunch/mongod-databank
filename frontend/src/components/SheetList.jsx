import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useApi } from '../context/ApiContext';

const SheetList = () => {
  const [sheets, setSheets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [localError, setLocalError] = useState(null);
  const { getSheets, deleteSheet, loading, error } = useApi();
  const navigate = useNavigate();

  // Fetch sheets on component mount
  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const data = await getSheets();
      setSheets(data);
      setLocalError(null);
    } catch (err) {
      setLocalError('Failed to load sheets. Please try again.');
      console.error('Error fetching sheets:', err);
    }
  };

  const handleSheetClick = (id) => {
    navigate(`/sheets/${id}`);
  };

  const handleCreateSheet = () => {
    navigate('/sheets/new');
  };

  const handleEditSheet = (e, id) => {
    e.stopPropagation();
    navigate(`/sheets/${id}`);
  };

  const handleDeleteClick = (e, sheet) => {
    e.stopPropagation();
    setSheetToDelete(sheet);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sheetToDelete) return;
    
    try {
      await deleteSheet(sheetToDelete._id);
      setSheets(sheets.filter(sheet => sheet._id !== sheetToDelete._id));
      setLocalError(null);
    } catch (err) {
      setLocalError('Failed to delete sheet. Please try again.');
      console.error('Error deleting sheet:', err);
    } finally {
      setDeleteDialogOpen(false);
      setSheetToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Your Sheets
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleCreateSheet}
        >
          New Sheet
        </Button>
      </Box>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || localError}
        </Alert>
      )}

      {sheets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No sheets found. Create your first sheet to get started!
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleCreateSheet}
            sx={{ mt: 2 }}
          >
            Create Sheet
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {sheets.map((sheet) => (
              <ListItem 
                key={sheet._id} 
                button 
                onClick={() => handleSheetClick(sheet._id)}
                divider
              >
                <ListItemText 
                  primary={sheet.sheetName} 
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="edit"
                    onClick={(e) => handleEditSheet(e, sheet._id)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => handleDeleteClick(e, sheet)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Sheet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the sheet "{sheetToDelete?.sheetName}"? 
            This action cannot be undone and all data will be permanently lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SheetList;