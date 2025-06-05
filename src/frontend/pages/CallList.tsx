import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';

interface Call {
  id: string;
  fio: string;
  address: string;
  type: string;
  date: string;
  status: string;
  phone: string;
  symptoms: string;
  priority: 'green' | 'yellow' | 'red';
}

export const CallList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls/');
      if (!response.ok) {
        throw new Error('Не удалось загрузить список вызовов');
      }
      const data = await response.json();
      setCalls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке вызовов');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'принят':
        return 'info';
      case 'в работе':
        return 'warning';
      case 'завершён':
      case 'завершен':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority.toLowerCase()) {
      case 'red':
        return 'error';
      case 'yellow':
        return 'warning';
      case 'green':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'red':
        return 'Красный';
      case 'yellow':
        return 'Жёлтый';
      case 'green':
        return 'Зелёный';
      default:
        return priority;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Ошибка</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (calls.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Текущие вызовы
        </Typography>
        <Alert severity="info">
          <AlertTitle>Информация</AlertTitle>
          Нет текущих вызовов
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Текущие вызовы
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ФИО</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Приоритет</TableCell>
              <TableCell>Дата и время</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((call) => (
              <TableRow key={call.id}>
                <TableCell>{call.fio}</TableCell>
                <TableCell>{call.address}</TableCell>
                <TableCell>
                  <Chip
                    label={getPriorityLabel(call.priority)}
                    color={getPriorityColor(call.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(call.date).toLocaleString('ru-RU')}</TableCell>
                <TableCell>
                  <Chip
                    label={call.status}
                    color={getStatusColor(call.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 