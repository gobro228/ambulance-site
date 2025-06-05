import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { LocalHospital, AddCircle, Inventory, Warehouse } from '@mui/icons-material';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 'bold' }}
            >
              Скорая помощь
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                component={RouterLink}
                to="/"
                color="inherit"
                startIcon={<LocalHospital />}
              >
                Вызовы
              </Button>
              <Button
                component={RouterLink}
                to="/new-call"
                color="inherit"
                startIcon={<AddCircle />}
              >
                Новый вызов
              </Button>
              <Button
                component={RouterLink}
                to="/inventory"
                color="inherit"
                startIcon={<Inventory />}
              >
                Инвентарь
              </Button>
              <Button
                component={RouterLink}
                to="/warehouse"
                color="inherit"
                startIcon={<Warehouse />}
              >
                Склад
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}; 