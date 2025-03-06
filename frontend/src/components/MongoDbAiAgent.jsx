import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Send as SendIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useApi } from '../context/ApiContext';

const MongoDbAiAgent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  
  const { loading: apiLoading } = useApi();
  
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Add the current query to history
      const newHistoryItem = {
        id: Date.now(),
        query: query,
        timestamp: new Date().toISOString()
      };
      
      // Make API call to the backend AI agent endpoint
      const response = await fetch('http://localhost:3000/api/data/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update history with results
      newHistoryItem.results = data;
      setHistory(prev => [newHistoryItem, ...prev]);
      
      // Set results
      setResults(data);
      setQuery('');
    } catch (err) {
      console.error('Error processing AI query:', err);
      setError('Failed to process your query. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearResults = () => {
    setResults(null);
  };
  
  const renderResults = () => {
    if (!results) return null;
    
    if (results.type === 'error') {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {results.message}
        </Alert>
      );
    }
    
    if (results.type === 'message') {
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="body1">{results.message}</Typography>
          {results.database && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                MongoDB Operation Details:
              </Typography>
              <Typography variant="body2" component="div">
                <Box sx={{ mb: 1 }}>Collection: {results.database.collection}</Box>
                <Box sx={{ mb: 1 }}>Operation: {results.database.operation}</Box>
                <Box sx={{ mb: 1 }}>Filter: {JSON.stringify(results.database.filter, null, 2)}</Box>
                {Object.keys(results.database.appliedFilters).length > 0 && (
                  <Box sx={{ mb: 1 }}>Applied Filters: {JSON.stringify(results.database.appliedFilters, null, 2)}</Box>
                )}
                <Box>Results Found: {results.database.resultCount}</Box>
              </Typography>
            </Box>
          )}
        </Paper>
      );
    }
    
    if (results.type === 'data' && results.data && results.data.length > 0) {
      // Get column headers from the first result object
      const columns = Object.keys(results.data[0]);
      
      return (
        <Paper sx={{ mt: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{results.message || 'Query Results'}</Typography>
            <Typography variant="body2" color="textSecondary">
              {results.data.length} {results.data.length === 1 ? 'result' : 'results'} found
            </Typography>
            {results.database && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  MongoDB Operation Details:
                </Typography>
                <Typography variant="body2" component="div">
                  <Box sx={{ mb: 1 }}>Collection: {results.database.collection}</Box>
                  <Box sx={{ mb: 1 }}>Operation: {results.database.operation}</Box>
                  <Box sx={{ mb: 1 }}>Filter: {JSON.stringify(results.database.filter, null, 2)}</Box>
                  {Object.keys(results.database.appliedFilters).length > 0 && (
                    <Box sx={{ mb: 1 }}>Applied Filters: {JSON.stringify(results.database.appliedFilters, null, 2)}</Box>
                  )}
                  {results.database.sort && (
                    <Box sx={{ mb: 1 }}>Sort: {JSON.stringify(results.database.sort, null, 2)}</Box>
                  )}
                  <Box>Results Found: {results.database.resultCount}</Box>
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      <Typography variant="subtitle2">
                        {column}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {results.data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {formatCellValue(row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography>No results found for your query.</Typography>
      </Paper>
    );
  };
  
  // Helper function to format cell values
  const formatCellValue = (value) => {
    if (value === undefined || value === null) return '';
    
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      return new Date(value).toLocaleDateString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        MongoDB AI Assistant
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Ask questions about your data in natural language. For example: "Show me all sales data for electronics" or "Find employees with salaries over 80000".
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              label="Ask a question about your data"
              variant="outlined"
              value={query}
              onChange={handleQueryChange}
              multiline
              rows={2}
              disabled={loading || apiLoading}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!query.trim() || loading || apiLoading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ mt: 1, height: 56 }}
            >
              Ask
            </Button>
          </Box>
        </form>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {results && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Clear results">
            <IconButton onClick={clearResults} color="default">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {renderResults()}
      
      {history.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Queries
          </Typography>
          <Paper>
            {history.map((item) => (
              <Box key={item.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle2">
                  {new Date(item.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium', my: 1 }}>
                  {item.query}
                </Typography>
                {item.results && item.results.message && (
                  <Typography variant="body2" color="textSecondary">
                    {item.results.type === 'data' 
                      ? `Found ${item.results.data?.length || 0} results` 
                      : item.results.message}
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default MongoDbAiAgent;