import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';

interface InventoryItem {
  item_id: string;
  name: string;
  quantity: number;
  required: boolean;
  unit: string;
  available: number;
}

interface InventorySet {
  name: string;
  description: string;
  items: InventoryItem[];
}

interface InventorySetViewProps {
  callType: string;
}

const InventorySetView: React.FC<InventorySetViewProps> = ({ callType }) => {
  const [loading, setLoading] = useState(true);
  const [inventorySet, setInventorySet] = useState<InventorySet | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventorySet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory/sets/${encodeURIComponent(callType)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch inventory set');
        }
        const data = await response.json();
        setInventorySet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке набора');
      } finally {
        setLoading(false);
      }
    };

    if (callType) {
      fetchInventorySet();
    }
  }, [callType]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!inventorySet) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Рекомендуемый набор инвентаря
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {inventorySet.description}
      </Typography>
      <List>
        {inventorySet.items.map((item) => (
          <ListItem
            key={item.item_id}
            sx={{
              borderRadius: 1,
              mb: 1,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center">
                  <Typography variant="body1">{item.name}</Typography>
                  {item.required && (
                    <Chip
                      size="small"
                      label="Обязательно"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box display="flex" alignItems="center" mt={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Требуется: {item.quantity} {item.unit}
                  </Typography>
                  <Box ml={2} display="flex" alignItems="center">
                    {item.available >= item.quantity ? (
                      <>
                        <CheckIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" color="success.main">
                          Доступно: {item.available} {item.unit}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <WarningIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" color="warning.main">
                          Недостаточно! Доступно: {item.available} {item.unit}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InventorySetView; 