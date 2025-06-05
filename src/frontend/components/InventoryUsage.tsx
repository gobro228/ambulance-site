import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Text
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
}

interface InventoryUsage {
  item_id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface InventoryUsageProps {
  callId: string;
  inventoryUsed: InventoryUsage[];
  onUpdate: () => void;
}

export const InventoryUsage: React.FC<InventoryUsageProps> = ({ callId, inventoryUsed, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список инвентаря',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddUsage = async () => {
    if (!selectedItem || quantity <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите предмет и укажите количество',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/inventory/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: callId,
          item_id: selectedItem,
          quantity,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add inventory usage');
      }

      toast({
        title: 'Успешно',
        description: 'Инвентарь добавлен к вызову',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsOpen(false);
      setSelectedItem('');
      setQuantity(1);
      setNotes('');
      onUpdate();
    } catch (error) {
      console.error('Error adding inventory usage:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить инвентарь',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">Использованный инвентарь</Text>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={() => setIsOpen(true)}>
          Добавить
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Название</Th>
            <Th>Количество</Th>
            <Th>Примечание</Th>
          </Tr>
        </Thead>
        <Tbody>
          {inventoryUsed.map((item, index) => (
            <Tr key={index}>
              <Td>{item.name}</Td>
              <Td>{item.quantity} {item.unit}</Td>
              <Td>{item.notes}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить инвентарь</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Предмет</FormLabel>
              <Select
                placeholder="Выберите предмет"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                {inventory.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.quantity} {item.unit})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Количество</FormLabel>
              <NumberInput min={1} value={quantity} onChange={(_, value) => setQuantity(value)}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Примечание</FormLabel>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительная информация"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              mr={3}
              mt={6}
              width="full"
              onClick={handleAddUsage}
            >
              Добавить
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 