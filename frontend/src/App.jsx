import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';

// Components
import Header from './components/Header';
import SheetList from './components/SheetList';
import SheetDetail from './components/SheetDetail';
import CreateSheet from './components/CreateSheet';
import MongoDbAiAgent from './components/MongoDbAiAgent';
import InsightsPage from './components/InsightsPage';

// Context
import { ApiProvider } from './context/ApiContext';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ApiProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              <Route path="/" element={<SheetList />} />
              <Route path="/sheets/new" element={<CreateSheet />} />
              <Route path="/sheets/:id" element={<SheetDetail />} />
              <Route path="/ai-assistant" element={<MongoDbAiAgent />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/insights/:id" element={<InsightsPage />} />
            </Routes>
          </Container>
        </Box>
      </ThemeProvider>
    </ApiProvider>
  );
}

export default App;