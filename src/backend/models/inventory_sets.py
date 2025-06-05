from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class InventorySetItem(BaseModel):
    """Модель для предмета в наборе инвентаря"""
    item_id: str = Field(..., description="ID предмета инвентаря")
    quantity: int = Field(..., description="Рекомендуемое количество")
    required: bool = Field(default=True, description="Обязательный предмет или опциональный")

class InventorySet(BaseModel):
    """Модель для набора инвентаря"""
    id: str = Field(alias="_id", description="ID набора")
    name: str = Field(..., description="Название набора")
    call_type: str = Field(..., description="Тип вызова")
    description: Optional[str] = Field(None, description="Описание набора")
    items: List[InventorySetItem] = Field(..., description="Список предметов в наборе")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True

# Предустановленные наборы инвентаря для разных типов вызовов
DEFAULT_INVENTORY_SETS = [
    {
        "name": "Базовый набор для зеленого потока",
        "call_type": "Зелёный поток",
        "description": "Стандартный набор для несрочных вызовов",
        "items": [
            {"item_id": "tonometer", "quantity": 1, "required": True},  # Тонометр
            {"item_id": "gloves", "quantity": 2, "required": True},     # Перчатки
            {"item_id": "mask", "quantity": 2, "required": True},       # Маски
            {"item_id": "thermometer", "quantity": 1, "required": True} # Термометр
        ]
    },
    {
        "name": "Набор для желтого потока",
        "call_type": "Жёлтый поток",
        "description": "Набор для срочных вызовов",
        "items": [
            {"item_id": "tonometer", "quantity": 1, "required": True},      # Тонометр
            {"item_id": "gloves", "quantity": 4, "required": True},         # Перчатки
            {"item_id": "mask", "quantity": 4, "required": True},           # Маски
            {"item_id": "thermometer", "quantity": 1, "required": True},    # Термометр
            {"item_id": "bandage", "quantity": 2, "required": True},       # Бинты
            {"item_id": "syringe", "quantity": 5, "required": True},       # Шприцы
            {"item_id": "analgin", "quantity": 2, "required": False},      # Анальгин
            {"item_id": "sodium_chloride", "quantity": 1, "required": False} # Физраствор
        ]
    },
    {
        "name": "Набор для красного потока",
        "call_type": "Красный поток",
        "description": "Набор для экстренных вызовов",
        "items": [
            {"item_id": "tonometer", "quantity": 1, "required": True},      # Тонометр
            {"item_id": "gloves", "quantity": 6, "required": True},         # Перчатки
            {"item_id": "mask", "quantity": 6, "required": True},           # Маски
            {"item_id": "thermometer", "quantity": 1, "required": True},    # Термометр
            {"item_id": "bandage", "quantity": 4, "required": True},       # Бинты
            {"item_id": "syringe", "quantity": 10, "required": True},      # Шприцы
            {"item_id": "analgin", "quantity": 4, "required": True},       # Анальгин
            {"item_id": "adrenaline", "quantity": 2, "required": True},    # Адреналин
            {"item_id": "sodium_chloride", "quantity": 2, "required": True}, # Физраствор
            {"item_id": "scissors", "quantity": 1, "required": True},       # Ножницы
            {"item_id": "gauze", "quantity": 4, "required": True}          # Марля
        ]
    }
] 