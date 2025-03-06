import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useApi } from '../context/ApiContext';

const SheetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSheetById, updateSheet, addRow, updateRow, deleteRow, loading, error } = useApi();
  
  const [sheet, setSheet] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [rowData, setRowData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  // Fetch sheet data on component mount
  useEffect(() => {
    fetchSheetData();
  }, [id]);

  const fetchSheetData = async () => {
    try {
      const data = await getSheetById(id);
      setSheet(data);
      setLocalError(null);
    } catch (err) {
      setLocalError('Failed to load sheet data. Please try again.');
      console.error('Error fetching sheet:', err);
    }
  };

  // Handle row editing
  const handleEditClick = (row) => {
    setEditingRow(row._id);
    setRowData({...row.data});
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setRowData({});
  };

  const handleSaveEdit = async (rowId) => {
    try {
      await updateRow(id, rowId, { data: rowData });
      setEditingRow(null);
      setRowData({});
      fetchSheetData(); // Refresh data
    } catch (err) {
      setLocalError('Failed to update row. Please try again.');
      console.error('Error updating row:', err);
    }
  };

  const handleInputChange = (column, value) => {
    setRowData(prev => ({
      ...prev,
      [column.name]: value
    }));
  };

  // Handle row deletion
  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!rowToDelete) return;
    
    try {
      await deleteRow(id, rowToDelete._id);
      fetchSheetData(); // Refresh data
    } catch (err) {
      setLocalError('Failed to delete row. Please try again.');
      console.error('Error deleting row:', err);
    } finally {
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  // Handle adding new row
  const handleAddClick = () => {
    const initialData = {};
    if (sheet && sheet.columns) {
      sheet.columns.forEach(col => {
        initialData[col.name] = '';
      });
    }
    setNewRowData(initialData);
    setAddDialogOpen(true);
  };

  const handleAddInputChange = (column, value) => {
    setNewRowData(prev => ({
      ...prev,
      [column.name]: value
    }));
  };

  const handleAddConfirm = async () => {
    try {
      await addRow(id, { data: newRowData });
      setAddDialogOpen(false);
      setNewRowData({});
      fetchSheetData(); // Refresh data
    } catch (err) {
      setLocalError('Failed to add row. Please try again.');
      console.error('Error adding row:', err);
    }
  };

  const handleAddCancel = () => {
    setAddDialogOpen(false);
    setNewRowData({});
  };

  // Format cell value based on column type
  const formatCellValue = (value, type) => {
    if (value === undefined || value === null) return '';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return value.toString();
    }
  };

  if (loading && !sheet) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sheet && !loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          Sheet not found or failed to load. Please try again.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Sheets
        </Button>
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {sheet.sheetName}
        </Typography>
      </Box>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || localError}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          disabled={loading}
        >
          Add Row
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {sheet.columns.map((column) => (
                  <TableCell key={column.name} style={{ minWidth: column.width || 100 }}>
                    <Typography variant="subtitle2">
                      {column.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {column.type === 'string' ? 'Text' : 
                       column.type === 'number' ? 'Number' : 
                       column.type === 'date' ? 'Date' : 'Boolean'}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="right" style={{ minWidth: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sheet.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={sheet.columns.length + 1} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No data available. Add a row to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sheet.rows.map((row) => (
                  <TableRow key={row._id}>
                    {sheet.columns.map((column) => (
                      <TableCell key={`${row._id}-${column.name}`}>
                        {editingRow === row._id ? (
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            type={column.type === 'number' ? 'number' : 'text'}
                            value={rowData[column.name] || ''}
                            onChange={(e) => handleInputChange(column, e.target.value)}
                          />
                        ) : (
                          formatCellValue(row.data[column.name], column.type)
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      {editingRow === row._id ? (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleSaveEdit(row._id)}
                            disabled={loading}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            color="default"
                            onClick={handleCancelEdit}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditClick(row)}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(row)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Row Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Row</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this row? This action cannot be undone.
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

      {/* Add Row Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Row</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {sheet.columns.map((column) => (
              <TextField
                key={column.name}
                label={column.name}
                fullWidth
                variant="outlined"
                margin="normal"
                type={column.type === 'number' ? 'number' : 'text'}
                value={newRowData[column.name] || ''}
                onChange={(e) => handleAddInputChange(column, e.target.value)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddConfirm} color="primary" variant="contained">
            Add Row
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SheetDetail;