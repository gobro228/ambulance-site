import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CallList } from './pages/CallList';
import CreateCall from '../components/CreateCall';
import { InventoryPage } from './pages/Inventory';
import { Warehouse } from './pages/Warehouse';
import { ThemeProvider, createTheme } from '@mui/material';
import LoginPage from './components/LoginPage';

// Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3c72',
      light: '#2a5298',
      dark: '#15294d',
    },
    secondary: {
      main: '#FF4B4B',
      light: '#ff7373',
      dark: '#cc3c3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // В реальном приложении здесь будет запрос к API
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Неверные учетные данные');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<CallList />} />
              <Route path="/new-call" element={<CreateCall />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/warehouse" element={<Warehouse />} />
            </Routes>
          </Layout>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App; 