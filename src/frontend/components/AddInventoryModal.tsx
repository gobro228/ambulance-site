import React, { useState } from 'react';
import {
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
  Button,
  VStack,
  useToast
} from '@chakra-ui/react';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [minimumQuantity, setMinimumQuantity] = useState(0);
  const toast = useToast();

  const units = ['шт', 'уп', 'мл', 'мг', 'амп'];

  const handleSubmit = async () => {
    if (!name || !description || !category || !unit || quantity < 0 || minimumQuantity < 0) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          category,
          unit,
          quantity,
          minimum_quantity: minimumQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add inventory item');
      }

      toast({
        title: 'Успешно',
        description: 'Предмет инвентаря добавлен',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Сброс формы
      setName('');
      setDescription('');
      setCategory('');
      setUnit('');
      setQuantity(0);
      setMinimumQuantity(0);

      onSuccess();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить предмет инвентаря',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Добавить предмет инвентаря</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Название</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название предмета"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Описание</FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание предмета"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Категория</FormLabel>
              <Select
                placeholder="Выберите категорию"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Единица измерения</FormLabel>
              <Select
                placeholder="Выберите единицу измерения"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Количество</FormLabel>
              <NumberInput min={0} value={quantity} onChange={(_, value) => setQuantity(value)}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Минимальное количество</FormLabel>
              <NumberInput
                min={0}
                value={minimumQuantity}
                onChange={(_, value) => setMinimumQuantity(value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <Button colorScheme="blue" mr={3} width="full" onClick={handleSubmit}>
              Добавить
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 