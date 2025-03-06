import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import {
  TableChart as TableChartIcon,
  Add as AddIcon,
  Psychology as PsychologyIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TableChartIcon sx={{ mr: 1 }} />
            MongoDB Excel Data
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={<TableChartIcon />}
              sx={{ mr: 1 }}
            >
              Sheets
            </Button>
            <Button
              component={RouterLink}
              to="/sheets/new"
              color="inherit"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              New Sheet
            </Button>
            <Button
              component={RouterLink}
              to="/ai-assistant"
              color="inherit"
              startIcon={<PsychologyIcon />}
              sx={{ mr: 1 }}
            >
              AI Assistant
            </Button>
            <Button
              component={RouterLink}
              to="/insights"
              color="inherit"
              startIcon={<InsightsIcon />}
            >
              Insights
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;