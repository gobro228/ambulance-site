import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Progress,
  Badge,
  Stack,
} from '@chakra-ui/react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minimum_quantity: number;
  unit: string;
}

export const InventoryPage = () => {
  // В реальном приложении данные будут загружаться с сервера
  const inventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Анальгин',
      category: 'Медикаменты',
      quantity: 150,
      minimum_quantity: 50,
      unit: 'ампула'
    },
    {
      id: '2',
      name: 'Бинт',
      category: 'Перевязочные материалы',
      quantity: 80,
      minimum_quantity: 100,
      unit: 'шт'
    },
    // Другие предметы...
  ];

  const getStockStatus = (current: number, minimum: number) => {
    const ratio = current / minimum;
    if (ratio < 1) return { color: 'red', text: 'Недостаточно' };
    if (ratio < 1.5) return { color: 'yellow', text: 'Низкий запас' };
    return { color: 'green', text: 'В наличии' };
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Инвентарь</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {inventory.map((item) => {
          const status = getStockStatus(item.quantity, item.minimum_quantity);
          const percentage = (item.quantity / item.minimum_quantity) * 100;
          
          return (
            <Card key={item.id}>
              <CardHeader>
                <Stack spacing={2}>
                  <Heading size="md">{item.name}</Heading>
                  <Badge colorScheme={status.color} alignSelf="start">
                    {status.text}
                  </Badge>
                </Stack>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Text color="gray.600">Категория: {item.category}</Text>
                  <Box>
                    <Text mb={2}>
                      В наличии: {item.quantity} {item.unit}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Минимальный запас: {item.minimum_quantity} {item.unit}
                    </Text>
                    <Progress
                      value={percentage}
                      colorScheme={status.color}
                      borderRadius="full"
                    />
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}; 