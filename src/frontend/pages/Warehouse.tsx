import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Перечисления в соответствии с бэкендом
enum InventoryCategory {
  MEDICATIONS = "Медикаменты",
  DRESSINGS = "Перевязочные материалы",
  INSTRUMENTS = "Инструменты",
  EQUIPMENT = "Оборудование",
  CONSUMABLES = "Расходные материалы"
}

enum UnitType {
  PIECE = "шт",
  PACK = "уп",
  ML = "мл",
  MG = "мг",
  AMPOULE = "амп"
}

interface WarehouseItem {
  _id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  unit: UnitType;
  quantity: number;
  minimum_quantity: number;
  created_at: string;
  updated_at: string;
}

interface ItemFormData {
  name: string;
  description: string;
  category: InventoryCategory;
  unit: UnitType;
  quantity: number;
  minimum_quantity: number;
}

const initialFormData: ItemFormData = {
  name: '',
  description: '',
  category: InventoryCategory.MEDICATIONS,
  unit: UnitType.PIECE,
  quantity: 0,
  minimum_quantity: 0,
};

export const Warehouse = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);

  useEffect(() => {
    fetchWarehouseItems();
  }, []);

  const fetchWarehouseItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Начинаем загрузку данных...');
      
      const response = await fetch('http://127.0.0.1:8000/api/inventory/items');
      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Ошибка ответа:', errorData);
        throw new Error(`Не удалось загрузить данные склада: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Получены данные:', data);
      
      if (!Array.isArray(data)) {
        console.error('Получены некорректные данные:', data);
        throw new Error('Получены некорректные данные с сервера');
      }

      setItems(data);
      console.log('Данные успешно обновлены');
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить товар');
      }

      await fetchWarehouseItems();
      setIsDialogOpen(false);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при добавлении товара');
    }
  };

  const getQuantityColor = (quantity: number, minimumQuantity: number) => {
    if (quantity <= minimumQuantity * 0.5) return 'error';
    if (quantity <= minimumQuantity) return 'warning';
    return 'success';
  };

  const getQuantityStatus = (item: WarehouseItem) => {
    const percentage = (item.quantity / item.minimum_quantity) * 100;
    if (percentage <= 50) return 'Критически мало';
    if (percentage <= 100) return 'Мало';
    return 'В наличии';
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 70px)"
        sx={{ 
          backgroundColor: '#f8f9fa',
          marginTop: '70px'
        }}
      >
        <CircularProgress sx={{ color: '#ff6b6b' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: '#f8f9fa',
        minHeight: 'calc(100vh - 70px)',
        marginTop: '70px',
        padding: '20px',
        position: 'relative'
      }}
    >
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-icon': {
              color: '#ff6b6b'
            }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2,
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <FormControl 
            variant="outlined" 
            size="small"
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          >
            <InputLabel>Категория</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Категория"
            >
              <MenuItem value="all">Все категории</MenuItem>
              {Object.values(InventoryCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
            sx={{ 
              height: 40,
              backgroundColor: '#ff6b6b',
              borderRadius: 1,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#ff5252',
              },
            }}
          >
            Добавить товар
          </Button>
        </Stack>
      </Paper>

      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Наименование</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Описание</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Категория</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500, color: '#495057' }}>Количество</TableCell>
              <TableCell align="right" sx={{ fontWeight: 500, color: '#495057' }}>Мин. количество</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Ед. изм.</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#495057' }}>Последнее обновление</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow 
                key={item._id}
                sx={{
                  backgroundColor: item.quantity <= item.minimum_quantity * 0.5 
                    ? 'rgba(255, 107, 107, 0.05)' 
                    : 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <TableCell sx={{ color: '#495057' }}>{item.name}</TableCell>
                <TableCell sx={{ color: '#495057' }}>{item.description}</TableCell>
                <TableCell sx={{ color: '#495057' }}>{item.category}</TableCell>
                <TableCell align="right" sx={{ color: '#495057' }}>{item.quantity}</TableCell>
                <TableCell align="right" sx={{ color: '#495057' }}>{item.minimum_quantity}</TableCell>
                <TableCell sx={{ color: '#495057' }}>{item.unit}</TableCell>
                <TableCell>
                  <Chip
                    label={getQuantityStatus(item)}
                    color={getQuantityColor(item.quantity, item.minimum_quantity)}
                    size="small"
                    sx={{ 
                      minWidth: 100,
                      fontWeight: 500,
                      borderRadius: 1
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#6c757d' }}>
                  {new Date(item.updated_at).toLocaleString('ru-RU')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: { 
            borderRadius: 1,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, color: '#495057' }}>Добавить новый товар</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Наименование"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
            <TextField
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                label="Категория"
                sx={{ borderRadius: 1 }}
              >
                {Object.values(InventoryCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Единица измерения</InputLabel>
              <Select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                label="Единица измерения"
                sx={{ borderRadius: 1 }}
              >
                {Object.values(UnitType).map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Количество"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
            <TextField
              label="Минимальное количество"
              type="number"
              value={formData.minimum_quantity}
              onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 0 })}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            sx={{ 
              color: '#6c757d',
              textTransform: 'none'
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              backgroundColor: '#ff6b6b',
              textTransform: 'none',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#ff5252',
              },
            }}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 