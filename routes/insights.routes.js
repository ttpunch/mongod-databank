// Insights routes for data analysis
const express = require('express');
const router = express.Router();
const Data = require('../models/data.model');

// Get insights across all sheets
router.get('/insights', async (req, res) => {
  try {
    // Fetch all sheets with their data
    const sheets = await Data.find({});
    
    if (!sheets || sheets.length === 0) {
      return res.status(404).json({ message: 'No sheets found for analysis' });
    }
    
    // Generate insights from the data
    const insights = generateInsights(sheets);
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get insights for a specific sheet
router.get('/insights/:sheetId', async (req, res) => {
  try {
    const sheet = await Data.findById(req.params.sheetId);
    
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    // Generate insights for the specific sheet
    const insights = generateSheetInsights(sheet);
    
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating sheet insights:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate insights across all sheets
function generateInsights(sheets) {
  const insights = {
    summary: {
      totalSheets: sheets.length,
      totalRows: sheets.reduce((sum, sheet) => sum + sheet.rows.length, 0),
      lastUpdated: findMostRecentUpdate(sheets)
    },
    sheetComparisons: [],
    dataDistribution: [],
    anomalies: [],
    recommendations: []
  };
  
  // Generate sheet comparisons
  insights.sheetComparisons = generateSheetComparisons(sheets);
  
  // Analyze data distribution across sheets
  insights.dataDistribution = analyzeDataDistribution(sheets);
  
  // Detect anomalies in the data
  insights.anomalies = detectAnomalies(sheets);
  
  // Generate recommendations based on the data
  insights.recommendations = generateRecommendations(sheets, insights);
  
  return insights;
}

// Generate insights for a specific sheet
function generateSheetInsights(sheet) {
  const insights = {
    summary: {
      sheetName: sheet.sheetName,
      rowCount: sheet.rows.length,
      columnCount: sheet.columns.length,
      lastUpdated: sheet.updatedAt
    },
    columnAnalysis: [],
    trends: [],
    statistics: {},
    recommendations: []
  };
  
  // Analyze each column in the sheet
  insights.columnAnalysis = analyzeColumns(sheet);
  
  // Identify trends in the data
  insights.trends = identifyTrends(sheet);
  
  // Calculate statistics for the sheet
  insights.statistics = calculateStatistics(sheet);
  
  // Generate recommendations for the sheet
  insights.recommendations = generateSheetRecommendations(sheet, insights);
  
  return insights;
}

// Find the most recent update across all sheets
function findMostRecentUpdate(sheets) {
  let mostRecent = new Date(0); // Start with epoch time
  
  sheets.forEach(sheet => {
    const sheetUpdated = new Date(sheet.updatedAt);
    if (sheetUpdated > mostRecent) {
      mostRecent = sheetUpdated;
    }
    
    sheet.rows.forEach(row => {
      const rowUpdated = new Date(row.updatedAt);
      if (rowUpdated > mostRecent) {
        mostRecent = rowUpdated;
      }
    });
  });
  
  return mostRecent;
}

// Generate comparisons between sheets
function generateSheetComparisons(sheets) {
  const comparisons = [];
  
  // Skip if there are less than 2 sheets
  if (sheets.length < 2) return comparisons;
  
  // Compare sheet sizes
  const sheetSizes = sheets.map(sheet => ({
    id: sheet._id,
    name: sheet.sheetName,
    rowCount: sheet.rows.length
  }));
  
  sheetSizes.sort((a, b) => b.rowCount - a.rowCount);
  
  comparisons.push({
    type: 'sheetSize',
    title: 'Sheet Size Comparison',
    description: `${sheetSizes[0].name} has the most rows (${sheetSizes[0].rowCount}), while ${sheetSizes[sheetSizes.length-1].name} has the least (${sheetSizes[sheetSizes.length-1].rowCount}).`,
    data: sheetSizes
  });
  
  // Add more comparisons as needed
  
  return comparisons;
}

// Analyze data distribution across sheets
function analyzeDataDistribution(sheets) {
  const distributions = [];
  
  // Analyze data types across sheets
  const dataTypes = {
    string: 0,
    number: 0,
    date: 0,
    boolean: 0
  };
  
  sheets.forEach(sheet => {
    sheet.columns.forEach(column => {
      dataTypes[column.type]++;
    });
  });
  
  distributions.push({
    type: 'dataTypes',
    title: 'Data Type Distribution',
    description: 'Distribution of data types across all sheets',
    data: dataTypes
  });
  
  return distributions;
}

// Detect anomalies in the data
function detectAnomalies(sheets) {
  const anomalies = [];
  
  sheets.forEach(sheet => {
    // Skip sheets with no rows
    if (sheet.rows.length === 0) return;
    
    // Check for numeric columns to detect outliers
    const numericColumns = sheet.columns.filter(col => col.type === 'number');
    
    numericColumns.forEach(column => {
      const values = sheet.rows
        .map(row => row.data[column.name])
        .filter(val => val !== undefined && val !== null);
      
      if (values.length > 0) {
        // Calculate mean and standard deviation
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        );
        
        // Find outliers (values more than 2 standard deviations from the mean)
        const outliers = sheet.rows.filter(row => {
          const value = row.data[column.name];
          return value !== undefined && value !== null && 
                 Math.abs(value - mean) > 2 * stdDev;
        });
        
        if (outliers.length > 0) {
          anomalies.push({
            type: 'outlier',
            sheetId: sheet._id,
            sheetName: sheet.sheetName,
            column: column.name,
            description: `Found ${outliers.length} outliers in ${column.name} column`,
            outlierCount: outliers.length,
            mean: mean,
            stdDev: stdDev
          });
        }
      }
    });
  });
  
  return anomalies;
}

// Generate recommendations based on the data
function generateRecommendations(sheets, insights) {
  const recommendations = [];
  
  // Recommend adding more data if sheets have few rows
  sheets.forEach(sheet => {
    if (sheet.rows.length < 3) {
      recommendations.push({
        type: 'dataVolume',
        sheetId: sheet._id,
        sheetName: sheet.sheetName,
        description: `Consider adding more data to ${sheet.sheetName} for better analysis.`,
        importance: 'medium'
      });
    }
  });
  
  // Recommend addressing anomalies if any were found
  if (insights.anomalies.length > 0) {
    recommendations.push({
      type: 'anomalyCheck',
      description: `Review ${insights.anomalies.length} potential data anomalies found across your sheets.`,
      importance: 'high'
    });
  }
  
  return recommendations;
}

// Analyze columns in a sheet
function analyzeColumns(sheet) {
  const columnAnalysis = [];
  
  sheet.columns.forEach(column => {
    const analysis = {
      name: column.name,
      type: column.type,
      nonEmptyCount: 0,
      uniqueValues: new Set()
    };
    
    // Analyze column data
    sheet.rows.forEach(row => {
      const value = row.data[column.name];
      if (value !== undefined && value !== null && value !== '') {
        analysis.nonEmptyCount++;
        analysis.uniqueValues.add(String(value));
      }
    });
    
    // Calculate completeness percentage
    analysis.completeness = sheet.rows.length > 0 ? 
      (analysis.nonEmptyCount / sheet.rows.length) * 100 : 100;
    
    // Convert Set to count for the response
    analysis.uniqueValueCount = analysis.uniqueValues.size;
    delete analysis.uniqueValues;
    
    // Add type-specific analysis
    if (column.type === 'number') {
      const values = sheet.rows
        .map(row => row.data[column.name])
        .filter(val => val !== undefined && val !== null);
      
      if (values.length > 0) {
        analysis.min = Math.min(...values);
        analysis.max = Math.max(...values);
        analysis.avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }
    
    columnAnalysis.push(analysis);
  });
  
  return columnAnalysis;
}

// Identify trends in the data
function identifyTrends(sheet) {
  const trends = [];
  
  // Look for date columns to analyze time-based trends
  const dateColumns = sheet.columns.filter(col => col.type === 'date');
  const numericColumns = sheet.columns.filter(col => col.type === 'number');
  
  // Skip if we don't have both date and numeric columns
  if (dateColumns.length === 0 || numericColumns.length === 0) return trends;
  
  // For each date column, look for trends with numeric columns
  dateColumns.forEach(dateColumn => {
    numericColumns.forEach(numericColumn => {
      // Get data points with both date and numeric values
      const dataPoints = sheet.rows
        .filter(row => 
          row.data[dateColumn.name] !== undefined && 
          row.data[numericColumn.name] !== undefined)
        .map(row => ({
          date: new Date(row.data[dateColumn.name]),
          value: row.data[numericColumn.name]
        }));
      
      // Skip if we don't have enough data points
      if (dataPoints.length < 2) return;
      
      // Sort by date
      dataPoints.sort((a, b) => a.date - b.date);
      
      // Calculate simple trend (increasing, decreasing, or fluctuating)
      let increasing = 0;
      let decreasing = 0;
      
      for (let i = 1; i < dataPoints.length; i++) {
        if (dataPoints[i].value > dataPoints[i-1].value) {
          increasing++;
        } else if (dataPoints[i].value < dataPoints[i-1].value) {
          decreasing++;
        }
      }
      
      let trendType = 'fluctuating';
      if (increasing > decreasing && increasing > (dataPoints.length - 1) * 0.6) {
        trendType = 'increasing';
      } else if (decreasing > increasing && decreasing > (dataPoints.length - 1) * 0.6) {
        trendType = 'decreasing';
      }
      
      trends.push({
        type: 'timeSeries',
        dateColumn: dateColumn.name,
        valueColumn: numericColumn.name,
        trendType: trendType,
        dataPoints: dataPoints.length,
        startDate: dataPoints[0].date,
        endDate: dataPoints[dataPoints.length - 1].date,
        startValue: dataPoints[0].value,
        endValue: dataPoints[dataPoints.length - 1].value,
        percentChange: ((dataPoints[dataPoints.length - 1].value - dataPoints[0].value) / dataPoints[0].value) * 100
      });
    });
  });
  
  return trends;
}

// Calculate statistics for a sheet
function calculateStatistics(sheet) {
  const statistics = {
    rowCount: sheet.rows.length,
    columnCount: sheet.columns.length,
    numericColumns: {},
    categoricalColumns: {}
  };
  
  // Calculate statistics for numeric columns
  sheet.columns.forEach(column => {
    if (column.type === 'number') {
      const values = sheet.rows
        .map(row => row.data[column.name])
        .filter(val => val !== undefined && val !== null);
      
      if (values.length > 0) {
        // Sort values for percentile calculations
        const sortedValues = [...values].sort((a, b) => a - b);
        
        statistics.numericColumns[column.name] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          median: sortedValues[Math.floor(sortedValues.length / 2)],
          sum: values.reduce((sum, val) => sum + val, 0),
          count: values.length
        };
      }
    } else if (column.type === 'string') {
      // For string columns, count frequencies of values
      const valueFrequency = {};
      
      sheet.rows.forEach(row => {
        const value = row.data[column.name];
        if (value !== undefined && value !== null && value !== '') {
          valueFrequency[value] = (valueFrequency[value] || 0) + 1;
        }
      });
    }
  });
  
  return statistics;
}

// Generate recommendations for a specific sheet
function generateSheetRecommendations(sheet, insights) {
  const recommendations = [];
  
  // Recommend adding more data if sheet has few rows
  if (sheet.rows.length < 3) {
    recommendations.push({
      type: 'dataVolume',
      description: `Consider adding more data to ${sheet.sheetName} for better analysis.`,
      importance: 'medium'
    });
  }
  
  // Recommend addressing incomplete columns
  insights.columnAnalysis.forEach(column => {
    if (column.completeness < 70) {
      recommendations.push({
        type: 'dataCompleteness',
        column: column.name,
        description: `${column.name} column is only ${column.completeness.toFixed(0)}% complete. Consider filling in missing values.`,
        importance: column.completeness < 50 ? 'high' : 'medium'
      });
    }
  });
  
  return recommendations;
}

module.exports = router;