import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Divider
} from '@chakra-ui/react';
import { InventoryUsage } from './InventoryUsage';

interface CallDetailsProps {
  call: {
    _id: string;
    patient_name: string;
    phone: string;
    address: string;
    symptoms: string;
    status: string;
    created_at: string;
    inventory_used: Array<{
      item_id: string;
      name: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
  };
  onUpdate: () => void;
}

export const CallDetails: React.FC<CallDetailsProps> = ({ call, onUpdate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'red';
      case 'in_progress':
        return 'yellow';
      case 'completed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Вызов №{call._id}
          </Text>
          <Badge colorScheme={getStatusColor(call.status)} fontSize="md">
            {call.status === 'new' && 'Новый'}
            {call.status === 'in_progress' && 'В работе'}
            {call.status === 'completed' && 'Завершен'}
          </Badge>
        </HStack>

        <Divider />

        <Box>
          <Text fontWeight="bold">Пациент:</Text>
          <Text>{call.patient_name}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Телефон:</Text>
          <Text>{call.phone}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Адрес:</Text>
          <Text>{call.address}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Симптомы:</Text>
          <Text>{call.symptoms}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Время вызова:</Text>
          <Text>{formatDate(call.created_at)}</Text>
        </Box>

        <Divider />

        <InventoryUsage
          callId={call._id}
          inventoryUsed={call.inventory_used || []}
          onUpdate={onUpdate}
        />
      </VStack>
    </Box>
  );
}; 