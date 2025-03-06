// Data model for Excel-like data
const mongoose = require('mongoose');

// Define a flexible schema for Excel-like data
// This schema allows for dynamic columns and data types
const DataSchema = new mongoose.Schema({
  sheetName: {
    type: String,
    required: true,
    trim: true
  },
  // Store column definitions
  columns: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean'],
      default: 'string'
    },
    width: Number
  }],
  // Store actual row data
  rows: [{
    // Using Mixed type to allow for flexible data structure
    data: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Enable strict mode to prevent saving fields that aren't in the schema
  strict: false
});

// Pre-save middleware to update the updatedAt timestamp
DataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
module.exports = mongoose.model('Data', DataSchema);