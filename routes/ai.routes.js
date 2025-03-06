// AI query processing routes
const express = require('express');
const router = express.Router();
const Data = require('../models/data.model');
const llmService = require('../services/llm.service');

// Process natural language queries
// Handle both POST and GET requests for the ai-query endpoint
router.post('/ai-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        type: 'error', 
        message: 'Query is required' 
      });
    }
    
    let queryIntent;
    try {
      // Try to process the query using the enhanced LLM service
      // The service now uses both text classification and sequence-to-sequence models
      queryIntent = await llmService.processQuery(query.toLowerCase());
      console.log('Query processed with enhanced LLM:', queryIntent);
      
      // Use the enhanced understanding from the sequence model to improve extraction
      if (queryIntent.enhancedUnderstanding) {
        console.log('Using enhanced understanding to improve query processing');
        // We could further parse the enhancedUnderstanding text to extract more accurate
        // parameters, but for now we'll use it as additional context
      }
    } catch (llmError) {
      console.warn('LLM processing failed, falling back to rule-based:', llmError.message);
      // Fallback to rule-based processing if LLM fails
      queryIntent = processQueryIntent(query.toLowerCase());
    }
    
    // Execute the appropriate database operation based on intent
    const result = await executeQuery(queryIntent);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({ 
      type: 'error', 
      message: 'Failed to process query: ' + error.message 
    });
  }
});

// Add GET handler for the same endpoint to support GET requests
router.get('/ai-query', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        type: 'error', 
        message: 'Query is required' 
      });
    }
    
    let queryIntent;
    try {
      // Try to process the query using the enhanced LLM service
      // The service now uses both text classification and sequence-to-sequence models
      queryIntent = await llmService.processQuery(query.toLowerCase());
      console.log('Query processed with enhanced LLM:', queryIntent);
      
      // Use the enhanced understanding from the sequence model to improve extraction
      if (queryIntent.enhancedUnderstanding) {
        console.log('Using enhanced understanding to improve query processing');
        // We could further parse the enhancedUnderstanding text to extract more accurate
        // parameters, but for now we'll use it as additional context
      }
    } catch (llmError) {
      console.warn('LLM processing failed, falling back to rule-based:', llmError.message);
      // Fallback to rule-based processing if LLM fails
      queryIntent = processQueryIntent(query.toLowerCase());
    }
    
    // Execute the appropriate database operation based on intent
    const result = await executeQuery(queryIntent);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({ 
      type: 'error', 
      message: 'Failed to process query: ' + error.message 
    });
  }
});

// Process the query to determine intent and extract parameters
function processQueryIntent(query) {
  // Initialize the intent object
  const intent = {
    action: null,     // 'find', 'count', etc.
    sheetName: null,  // Target sheet
    filters: {},      // Filter conditions
    fields: [],       // Fields to return
    limit: 100,       // Default limit
    sort: null        // Sort criteria
  };
  
  // Determine the action (find is the default)
  if (query.includes('how many') || query.includes('count')) {
    intent.action = 'count';
  } else {
    intent.action = 'find';
  }
  
  // Extract sheet name
  const sheetMatches = query.match(/in (\w+( \w+)*) sheet|from (\w+( \w+)*) sheet|(\w+( \w+)*) data|(\w+( \w+)*) sheet/);
  if (sheetMatches) {
    // Use the first non-undefined match group
    intent.sheetName = sheetMatches.slice(1).find(match => match !== undefined);
  }
  
  // Extract filters
  // Example: "products with price greater than 100"
  const greaterThanMatches = query.match(/(\w+) (greater than|more than|higher than|over|above) (\d+)/);
  if (greaterThanMatches) {
    const [, field, , value] = greaterThanMatches;
    intent.filters[field] = { $gt: parseFloat(value) };
  }
  
  // Example: "products with price less than 50"
  const lessThanMatches = query.match(/(\w+) (less than|lower than|under|below) (\d+)/);
  if (lessThanMatches) {
    const [, field, , value] = lessThanMatches;
    intent.filters[field] = { $lt: parseFloat(value) };
  }
  
  // Example: "products with category equal to electronics"
  const equalMatches = query.match(/(\w+) (equal to|equals|is|=) ([\w\s]+)/);
  if (equalMatches) {
    const [, field, , value] = equalMatches;
    intent.filters[field] = value.trim();
  }
  
  // Extract specific fields to return
  if (query.includes('show') || query.includes('display') || query.includes('get')) {
    const fieldMatches = query.match(/show (me |us )?(the |all )?(\w+(, \w+)*)/i);
    if (fieldMatches && fieldMatches[3]) {
      intent.fields = fieldMatches[3].split(', ');
    }
  }
  
  // Extract limit
  const limitMatches = query.match(/limit (to |of )?(\d+)|(\d+) results/);
  if (limitMatches) {
    const limit = limitMatches[2] || limitMatches[3];
    if (limit) {
      intent.limit = parseInt(limit, 10);
    }
  }
  
  // Extract sort criteria
  const sortMatches = query.match(/sort by (\w+)( (asc|ascending|desc|descending))?/);
  if (sortMatches) {
    const field = sortMatches[1];
    const direction = sortMatches[3];
    intent.sort = { field };
    
    if (direction && (direction === 'desc' || direction === 'descending')) {
      intent.sort.direction = -1;
    } else {
      intent.sort.direction = 1;
    }
  }
  
  return intent;
}

// Execute the query based on the processed intent
async function executeQuery(intent) {
  try {
    // Find the sheet by name if specified
    let query;
    let mongoDbOperation = {};
    
    // Track MongoDB operations for transparency
    mongoDbOperation.collection = 'Data';
    mongoDbOperation.operation = 'findOne';
    
    if (intent.sheetName) {
      // Case-insensitive search for sheet name
      const sheetNameRegex = new RegExp(intent.sheetName, 'i');
      query = Data.findOne({ sheetName: { $regex: sheetNameRegex } });
      mongoDbOperation.filter = { sheetName: { $regex: intent.sheetName, $options: 'i' } };
    } else {
      // If no sheet name specified, get the first sheet
      query = Data.findOne({});
      mongoDbOperation.filter = {};
    }
    
    console.log('Executing MongoDB query:', JSON.stringify(mongoDbOperation));
    const sheet = await query.exec();
    
    if (!sheet) {
      return {
        type: 'message',
        message: 'No matching sheet found. Please specify a valid sheet name.'
      };
    }
    
    // Process the action based on intent
    if (intent.action === 'count') {
      // Count rows that match the filters
      let count = 0;
      
      if (Object.keys(intent.filters).length > 0) {
        // Apply filters to count
        count = sheet.rows.filter(row => {
          return Object.entries(intent.filters).every(([field, condition]) => {
            if (typeof condition === 'object') {
              // Handle operators like $gt, $lt
              if (condition.$gt !== undefined) {
                return row.data[field] > condition.$gt;
              }
              if (condition.$lt !== undefined) {
                return row.data[field] < condition.$lt;
              }
            } else {
              // Simple equality
              return row.data[field] == condition;
            }
            return false;
          });
        }).length;
      } else {
        // No filters, count all rows
        count = sheet.rows.length;
      }
      
      return {
        type: 'message',
        message: `Found ${count} matching rows in "${sheet.sheetName}".`,
        database: {
          operation: 'find',
          collection: 'Data',
          filter: { sheetName: sheet.sheetName },
          appliedFilters: intent.filters,
          resultCount: count
        }
      };
    } else {
      // Default action is 'find'
      // Filter rows based on intent.filters
      let results = sheet.rows;
      
      if (Object.keys(intent.filters).length > 0) {
        results = results.filter(row => {
          return Object.entries(intent.filters).every(([field, condition]) => {
            if (typeof condition === 'object') {
              // Handle operators like $gt, $lt
              if (condition.$gt !== undefined) {
                return row.data[field] > condition.$gt;
              }
              if (condition.$lt !== undefined) {
                return row.data[field] < condition.$lt;
              }
            } else {
              // Simple equality
              return String(row.data[field]).toLowerCase() === String(condition).toLowerCase();
            }
            return false;
          });
        });
      }
      
      // Apply sort if specified
      if (intent.sort) {
        results.sort((a, b) => {
          const fieldA = a.data[intent.sort.field];
          const fieldB = b.data[intent.sort.field];
          
          if (fieldA < fieldB) return -1 * intent.sort.direction;
          if (fieldA > fieldB) return 1 * intent.sort.direction;
          return 0;
        });
      }
      
      // Apply limit
      results = results.slice(0, intent.limit);
      
      // Format the results
      const formattedResults = results.map(row => {
        // If specific fields are requested, only return those
        if (intent.fields.length > 0) {
          const filteredData = {};
          intent.fields.forEach(field => {
            if (row.data[field] !== undefined) {
              filteredData[field] = row.data[field];
            }
          });
          return filteredData;
        }
        // Otherwise return all data
        return row.data;
      });
      
      return {
        type: 'data',
        message: `Query results from "${sheet.sheetName}"`,
        data: formattedResults,
        database: {
          operation: 'find',
          collection: 'Data',
          filter: { sheetName: sheet.sheetName },
          appliedFilters: intent.filters,
          resultCount: formattedResults.length,
          limit: intent.limit,
          sort: intent.sort
        }
      };
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

module.exports = router;