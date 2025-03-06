import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Create context
const ApiContext = createContext();

// Base URL for API
const API_BASE_URL = 'http://localhost:3000/api/data';

// Provider component
export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Sheet operations
  const getSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sheets');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sheets');
      setLoading(false);
      throw err;
    }
  };

  const getSheetById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sheets/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sheet');
      setLoading(false);
      throw err;
    }
  };

  const createSheet = async (sheetData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/sheets', sheetData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sheet');
      setLoading(false);
      throw err;
    }
  };

  const updateSheet = async (id, sheetData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/sheets/${id}`, sheetData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update sheet');
      setLoading(false);
      throw err;
    }
  };

  const deleteSheet = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/sheets/${id}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sheet');
      setLoading(false);
      throw err;
    }
  };

  // Row operations
  const addRow = async (sheetId, rowData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/sheets/${sheetId}/rows`, rowData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add row');
      setLoading(false);
      throw err;
    }
  };

  const updateRow = async (sheetId, rowId, rowData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/sheets/${sheetId}/rows/${rowId}`, rowData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update row');
      setLoading(false);
      throw err;
    }
  };

  const deleteRow = async (sheetId, rowId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/sheets/${sheetId}/rows/${rowId}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete row');
      setLoading(false);
      throw err;
    }
  };

  // Insights operations
  const getAllInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/insights');
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch insights');
      setLoading(false);
      throw err;
    }
  };

  const getSheetInsights = async (sheetId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/insights/${sheetId}`);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sheet insights');
      setLoading(false);
      throw err;
    }
  };

  // Context value
  const value = {
    loading,
    error,
    getSheets,
    getSheetById,
    createSheet,
    updateSheet,
    deleteSheet,
    addRow,
    updateRow,
    deleteRow,
    getAllInsights,
    getSheetInsights
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};