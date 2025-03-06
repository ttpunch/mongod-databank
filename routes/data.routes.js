// Routes for data operations
const express = require('express');
const router = express.Router();
const Data = require('../models/data.model');

// Get all sheets
router.get('/sheets', async (req, res) => {
  try {
    // Only fetch sheet names and IDs to keep response light
    const sheets = await Data.find({}, 'sheetName _id');
    res.status(200).json(sheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new sheet
router.post('/sheets', async (req, res) => {
  try {
    const { sheetName, columns } = req.body;
    
    if (!sheetName) {
      return res.status(400).json({ message: 'Sheet name is required' });
    }
    
    const newSheet = new Data({
      sheetName,
      columns: columns || [],
      rows: []
    });
    
    const savedSheet = await newSheet.save();
    res.status(201).json(savedSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific sheet by ID
router.get('/sheets/:id', async (req, res) => {
  try {
    const sheet = await Data.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    res.status(200).json(sheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sheet properties (name, columns)
router.put('/sheets/:id', async (req, res) => {
  try {
    const { sheetName, columns } = req.body;
    const updateData = {};
    
    if (sheetName) updateData.sheetName = sheetName;
    if (columns) updateData.columns = columns;
    
    const updatedSheet = await Data.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedSheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.status(200).json(updatedSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a sheet
router.delete('/sheets/:id', async (req, res) => {
  try {
    const deletedSheet = await Data.findByIdAndDelete(req.params.id);
    
    if (!deletedSheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.status(200).json({ message: 'Sheet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a row to a sheet
router.post('/sheets/:id/rows', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'Row data is required' });
    }
    
    const sheet = await Data.findById(req.params.id);
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    const newRow = {
      data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    sheet.rows.push(newRow);
    const updatedSheet = await sheet.save();
    
    res.status(201).json({
      rowId: updatedSheet.rows[updatedSheet.rows.length - 1]._id,
      message: 'Row added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific row
router.put('/sheets/:sheetId/rows/:rowId', async (req, res) => {
  try {
    const { data } = req.body;
    const { sheetId, rowId } = req.params;
    
    const sheet = await Data.findById(sheetId);
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    const rowIndex = sheet.rows.findIndex(row => row._id.toString() === rowId);
    
    if (rowIndex === -1) {
      return res.status(404).json({ message: 'Row not found' });
    }
    
    sheet.rows[rowIndex].data = data;
    sheet.rows[rowIndex].updatedAt = Date.now();
    
    await sheet.save();
    
    res.status(200).json({ message: 'Row updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific row
router.delete('/sheets/:sheetId/rows/:rowId', async (req, res) => {
  try {
    const { sheetId, rowId } = req.params;
    
    const sheet = await Data.findById(sheetId);
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    const rowIndex = sheet.rows.findIndex(row => row._id.toString() === rowId);
    
    if (rowIndex === -1) {
      return res.status(404).json({ message: 'Row not found' });
    }
    
    sheet.rows.splice(rowIndex, 1);
    await sheet.save();
    
    res.status(200).json({ message: 'Row deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;