import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import { Add, Delete, ArrowBack } from '@mui/icons-material';
import { useApi } from '../context/ApiContext';

const CreateSheet = () => {
  const navigate = useNavigate();
  const { createSheet, loading, error } = useApi();
  const [sheetName, setSheetName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: 'string', width: 100 }]);
  const [localError, setLocalError] = useState(null);

  const handleAddColumn = () => {
    setColumns([...columns, { name: '', type: 'string', width: 100 }]);
  };

  const handleRemoveColumn = (index) => {
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate sheet name
    if (!sheetName.trim()) {
      setLocalError('Sheet name is required');
      return;
    }

    // Validate columns
    const validColumns = columns.filter(col => col.name.trim());
    if (validColumns.length === 0) {
      setLocalError('At least one column with a name is required');
      return;
    }

    try {
      const newSheet = await createSheet({
        sheetName: sheetName.trim(),
        columns: validColumns
      });
      navigate(`/sheets/${newSheet._id}`);
    } catch (err) {
      setLocalError('Failed to create sheet. Please try again.');
      console.error('Error creating sheet:', err);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Create New Sheet
        </Typography>
      </Box>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || localError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Sheet Name"
            variant="outlined"
            fullWidth
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            margin="normal"
            required
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Columns
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {columns.map((column, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Column Name"
                  variant="outlined"
                  fullWidth
                  value={column.name}
                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="string">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Width"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={column.width}
                  onChange={(e) => handleColumnChange(index, 'width', parseInt(e.target.value) || 100)}
                  InputProps={{ inputProps: { min: 50 } }}
                />
              </Grid>
              <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                {columns.length > 1 && (
                  <IconButton color="error" onClick={() => handleRemoveColumn(index)}>
                    <Delete />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddColumn}
            sx={{ mt: 1, mb: 3 }}
          >
            Add Column
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Sheet'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
};

export default CreateSheet;