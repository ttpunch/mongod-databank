import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApi } from '../context/ApiContext';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InsightsPage = () => {
  const { id } = useParams(); // Sheet ID if viewing a specific sheet's insights
  const { getAllInsights, getSheetInsights, loading, error } = useApi();
  
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState(null);

  // Fetch insights on component mount
  useEffect(() => {
    fetchInsights();
  }, [id]);

  const fetchInsights = async () => {
    try {
      let data;
      if (id) {
        // Fetch insights for a specific sheet
        data = await getSheetInsights(id);
      } else {
        // Fetch insights across all sheets
        data = await getAllInsights();
      }
      setInsights(data);
      setLocalError(null);
    } catch (err) {
      setLocalError('Failed to load insights. Please try again.');
      console.error('Error fetching insights:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (localError || error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {localError || error}
      </Alert>
    );
  }

  if (!insights) {
    return null;
  }

  // Determine if we're showing global insights or sheet-specific insights
  const isGlobalInsights = !id;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {isGlobalInsights ? 'Data Insights' : `Insights for ${insights.summary.sheetName}`}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={2}>
          {isGlobalInsights ? (
            // Global insights summary
            <>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Sheets
                    </Typography>
                    <Typography variant="h4">
                      {insights.summary.totalSheets}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Rows
                    </Typography>
                    <Typography variant="h4">
                      {insights.summary.totalRows}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="h6">
                      {new Date(insights.summary.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            // Sheet-specific insights summary
            <>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Rows
                    </Typography>
                    <Typography variant="h4">
                      {insights.summary.rowCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Columns
                    </Typography>
                    <Typography variant="h4">
                      {insights.summary.columnCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="h6">
                      {new Date(insights.summary.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="insights tabs">
          {isGlobalInsights ? (
            // Global insights tabs
            <>
              <Tab label="Data Distribution" />
              <Tab label="Sheet Comparisons" />
              <Tab label="Anomalies" />
              <Tab label="Recommendations" />
            </>
          ) : (
            // Sheet-specific insights tabs
            <>
              <Tab label="Column Analysis" />
              <Tab label="Trends" />
              <Tab label="Statistics" />
              <Tab label="Recommendations" />
            </>
          )}
        </Tabs>
      </Box>

      {isGlobalInsights ? (
        // Global insights tab panels
        <>
          {/* Data Distribution Tab */}
          {activeTab === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Data Type Distribution
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(insights.dataDistribution[0]?.data || {}).map(([key, value]) => ({
                        name: key,
                        value: value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(insights.dataDistribution[0]?.data || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {/* Sheet Comparisons Tab */}
          {activeTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sheet Size Comparison
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={insights.sheetComparisons[0]?.data || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rowCount" fill="#8884d8" name="Row Count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {/* Anomalies Tab */}
          {activeTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detected Anomalies
              </Typography>
              {insights.anomalies.length > 0 ? (
                <List>
                  {insights.anomalies.map((anomaly, index) => (
                    <ListItem key={index} divider={index < insights.anomalies.length - 1}>
                      <ListItemText
                        primary={`${anomaly.sheetName}: ${anomaly.column}`}
                        secondary={anomaly.description}
                      />
                      <Chip 
                        label={`${anomaly.outlierCount} outliers`} 
                        color="warning" 
                        variant="outlined" 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No anomalies detected in your data.</Alert>
              )}
            </Paper>
          )}

          {/* Recommendations Tab */}
          {activeTab === 3 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              {insights.recommendations.length > 0 ? (
                <List>
                  {insights.recommendations.map((recommendation, index) => (
                    <ListItem key={index} divider={index < insights.recommendations.length - 1}>
                      <ListItemText primary={recommendation.description} />
                      <Chip 
                        label={recommendation.importance} 
                        color={recommendation.importance === 'high' ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No recommendations available at this time.</Alert>
              )}
            </Paper>
          )}
        </>
      ) : (
        // Sheet-specific insights tab panels
        <>
          {/* Column Analysis Tab */}
          {activeTab === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Column Analysis
              </Typography>
              <Grid container spacing={2}>
                {insights.columnAnalysis.map((column, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardHeader 
                        title={column.name} 
                        subheader={`Type: ${column.type}`} 
                        action={
                          <Chip 
                            label={`${column.completeness.toFixed(0)}% complete`} 
                            color={column.completeness > 80 ? 'success' : 'warning'} 
                            size="small" 
                          />
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">
                          {column.nonEmptyCount} non-empty values ({column.uniqueValueCount} unique)
                        </Typography>
                        {column.type === 'number' && column.avg !== undefined && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Min: {column.min} | Max: {column.max} | Avg: {column.avg.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Trends Tab */}
          {activeTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Identified Trends
              </Typography>
              {insights.trends.length > 0 ? (
                <Grid container spacing={2}>
                  {insights.trends.map((trend, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined">
                        <CardHeader 
                          title={`${trend.valueColumn} over time`} 
                          subheader={`${trend.trendType} trend (${trend.percentChange.toFixed(2)}% change)`}
                          action={
                            <Chip 
                              label={trend.trendType} 
                              color={trend.trendType === 'increasing' ? 'success' : 
                                    trend.trendType === 'decreasing' ? 'error' : 'default'} 
                              size="small" 
                            />
                          }
                        />
                        <CardContent>
                          <Box sx={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={[
                                  { date: new Date(trend.startDate).toLocaleDateString(), value: trend.startValue },
                                  { date: new Date(trend.endDate).toLocaleDateString(), value: trend.endValue }
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={trend.trendType === 'increasing' ? '#00C49F' : trend.trendType === 'decreasing' ? '#FF8042' : '#8884d8'} 
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No trends identified in your data.</Alert>
              )}
            </Paper>
          )}

          {/* Statistics Tab */}
          {activeTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Statistical Analysis
              </Typography>
              {Object.keys(insights.statistics.numericColumns).length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(insights.statistics.numericColumns).map(([columnName, stats], index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardHeader title={columnName} />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" gutterBottom>
                            <strong>Min:</strong> {stats.min} | <strong>Max:</strong> {stats.max}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Average:</strong> {stats.avg.toFixed(2)} | <strong>Median:</strong> {stats.median}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Sum:</strong> {stats.sum} | <strong>Count:</strong> {stats.count}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No numeric data available for statistical analysis.</Alert>
              )}
            </Paper>
          )}

          {/* Recommendations Tab */}
          {activeTab === 3 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              {insights.recommendations.length > 0 ? (
                <List>
                  {insights.recommendations.map((recommendation, index) => (
                    <ListItem key={index} divider={index < insights.recommendations.length - 1}>
                      <ListItemText primary={recommendation.description} />
                      <Chip 
                        label={recommendation.importance} 
                        color={recommendation.importance === 'high' ? 'error' : 'warning'} 
                        size="small" 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No recommendations available for this sheet.</Alert>
              )}
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default InsightsPage;