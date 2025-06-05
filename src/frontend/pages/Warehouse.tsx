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
  IconButton,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon 
} from '@mui/icons-material';
import { predefinedItems } from '../data/inventoryItems.ts';

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
  category: InventoryCategory;
  quantity: number;
  name: string;
  description: string;
  unit: UnitType;
}

interface Alert {
  type: 'success' | 'error';
  message: string;
}

const initialFormData: ItemFormData = {
  category: InventoryCategory.MEDICATIONS,
  quantity: 0,
  name: '',
  description: '',
  unit: UnitType.PIECE,
};

export const Warehouse = () => {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>(initialFormData);
  const [refreshKey, setRefreshKey] = useState(0); // Для принудительного обновления данных
  const [selectedPredefinedItem, setSelectedPredefinedItem] = useState<string | null>(null);
  const [availableItems, setAvailableItems] = useState<Array<string>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WarehouseItem | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [decreaseDialogOpen, setDecreaseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [decreaseAmount, setDecreaseAmount] = useState<number>(0);

  const fetchWarehouseItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Начинаем загрузку данных...');
      
      const response = await fetch('http://127.0.0.1:8000/api/inventory/items', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Статус ответа:', response.status);
      console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Ошибка ответа:', errorData);
        throw new Error(`Не удалось загрузить данные склада: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.text(); // Сначала получаем текст ответа
      console.log('Сырой ответ:', rawData);
      
      const data = JSON.parse(rawData); // Затем парсим его
      console.log('Распарсенные данные:', data);
      
      if (!Array.isArray(data)) {
        console.error('Получены некорректные данные:', data);
        throw new Error('Получены некорректные данные с сервера');
      }

      console.log('Количество полученных элементов:', data.length);
      setItems(data);
      console.log('Данные успешно обновлены в состоянии');
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseItems();
  }, [refreshKey]); // Обновляем данные при изменении refreshKey

  useEffect(() => {
    if (formData.category) {
      const items = predefinedItems[formData.category]?.map(item => item.name) || [];
      setAvailableItems(items);
      setSelectedPredefinedItem(null); // Сбрасываем выбранный товар при смене категории
    }
  }, [formData.category]);

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Сначала проверяем, существует ли товар с таким именем
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/items/search?name=${encodeURIComponent(formData.name)}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка при поиске товара: ${response.status} ${response.statusText}`);
      }

      const existingItems = await response.json();
      const existingItem = existingItems.length > 0 ? existingItems[0] : null;

      let finalResponse;

      if (existingItem) {
        // Если товар существует, обновляем его количество
        const updatedQuantity = existingItem.quantity + formData.quantity;
        
        finalResponse = await fetch(`http://127.0.0.1:8000/api/inventory/${existingItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: updatedQuantity,
          }),
        });

        if (!finalResponse.ok) {
          const errorText = await finalResponse.text();
          console.error('Ошибка при обновлении:', errorText);
          throw new Error(`Не удалось обновить товар: ${errorText}`);
        }
      } else {
        // Если товар не существует, создаем новый
        finalResponse = await fetch('http://127.0.0.1:8000/api/inventory/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            minimum_quantity: 5
          }),
        });

        if (!finalResponse.ok) {
          const errorText = await finalResponse.text();
          console.error('Ошибка при создании:', errorText);
          throw new Error(`Не удалось создать товар: ${errorText}`);
        }
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setSelectedPredefinedItem(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Ошибка при обработке товара:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обработке товара');
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  const handlePredefinedItemChange = (event: any, newValue: string | null) => {
    setSelectedPredefinedItem(newValue);
    if (newValue && formData.category) {
      const selectedItem = predefinedItems[formData.category].find(item => item.name === newValue);
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          name: selectedItem.name,
          description: selectedItem.description,
          unit: selectedItem.unit as UnitType
        }));
      }
    }
  };

  const handleDeleteClick = (item: WarehouseItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/${itemToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Не удалось удалить предмет');
      }

      // Обновляем список после удаления
      handleRefresh();
      setDeleteDialogOpen(false);
      setItemToDelete(null);

      // Показываем уведомление об успешном удалении
      setAlert({
        type: 'success',
        message: 'Предмет успешно удален'
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Не удалось удалить предмет'
      });
    }
  };

  const handleDecreaseClick = () => {
    setDecreaseDialogOpen(true);
  };

  const handleDecreaseSubmit = async () => {
    if (!selectedItem || decreaseAmount <= 0) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/items/${selectedItem._id}/decrease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: decreaseAmount
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Не удалось уменьшить количество товара');
      }

      const updatedItem = await response.json();
      
      // Обновляем элемент в текущем состоянии
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === selectedItem._id ? { ...item, quantity: updatedItem.quantity } : item
        )
      );

      // Закрываем диалог и очищаем состояние
      setDecreaseDialogOpen(false);
      setSelectedItem(null);
      setDecreaseAmount(0);

      // Показываем уведомление об успешном уменьшении
      setAlert({
        type: 'success',
        message: 'Количество товара успешно уменьшено'
      });
    } catch (error) {
      console.error('Error decreasing item quantity:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Не удалось уменьшить количество товара'
      });
    }
  };

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

      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
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
          <Stack direction="row" spacing={2} alignItems="center">
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
            <Tooltip title="Обновить данные">
              <IconButton 
                onClick={handleRefresh}
                size="small"
                sx={{ 
                  color: '#ff6b6b',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RemoveIcon />}
              onClick={handleDecreaseClick}
              sx={{ 
                height: 40,
                backgroundColor: '#ff9800',
                borderRadius: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f57c00',
                },
              }}
            >
              Убрать товар
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsDialogOpen(true)}
              sx={{ 
                height: 40,
                backgroundColor: '#4caf50',
                borderRadius: 1,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
              }}
            >
              Добавить товар
            </Button>
          </Stack>
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
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#6c757d' }}>
                  {loading ? 'Загрузка данных...' : 'Нет данных для отображения'}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
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
              ))
            )}
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
            <FormControl fullWidth size="small" required>
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

            {formData.category && (
              <Autocomplete
                value={selectedPredefinedItem}
                onChange={handlePredefinedItemChange}
                options={availableItems}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Выберите товар из списка"
                    size="small"
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                  />
                )}
                fullWidth
              />
            )}

            <TextField
              label="Количество"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              fullWidth
              size="small"
              required
              inputProps={{ min: 0 }}
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

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 1,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#495057' }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          {itemToDelete && (
            <Box sx={{ py: 2 }}>
              Вы действительно хотите удалить предмет "{itemToDelete.name}"?
              {itemToDelete.quantity > 0 && (
                <Box sx={{ mt: 1, color: 'warning.main' }}>
                  Внимание: на складе еще остается {itemToDelete.quantity} {itemToDelete.unit}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: '#495057',
              '&:hover': {
                backgroundColor: 'rgba(73, 80, 87, 0.1)',
              }
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              '&:hover': {
                backgroundColor: '#ff5252',
              }
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог уменьшения количества товара */}
      <Dialog
        open={decreaseDialogOpen}
        onClose={() => setDecreaseDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 1,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#495057' }}>
          Убрать товар
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Товар</InputLabel>
              <Select
                value={selectedItem?._id || ''}
                onChange={(e) => {
                  const item = items.find(i => i._id === e.target.value);
                  setSelectedItem(item || null);
                }}
                label="Товар"
              >
                {items.map((item) => (
                  <MenuItem key={item._id} value={item._id}>
                    {item.name} (в наличии: {item.quantity} {item.unit})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedItem && (
              <TextField
                label="Количество"
                type="number"
                value={decreaseAmount}
                onChange={(e) => setDecreaseAmount(Math.max(0, parseInt(e.target.value) || 0))}
                fullWidth
                size="small"
                required
                inputProps={{ 
                  min: 0,
                  max: selectedItem.quantity
                }}
                helperText={`Максимально доступно: ${selectedItem.quantity} ${selectedItem.unit}`}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => {
              setDecreaseDialogOpen(false);
              setSelectedItem(null);
              setDecreaseAmount(0);
            }}
            sx={{
              color: '#495057',
              '&:hover': {
                backgroundColor: 'rgba(73, 80, 87, 0.1)',
              }
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDecreaseSubmit}
            disabled={!selectedItem || decreaseAmount <= 0 || decreaseAmount > selectedItem.quantity}
            sx={{
              backgroundColor: '#ff9800',
              color: 'white',
              '&:hover': {
                backgroundColor: '#f57c00',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 152, 0, 0.5)',
              }
            }}
          >
            Убрать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 