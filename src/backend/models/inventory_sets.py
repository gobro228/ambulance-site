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
            {"item_id": "Тонометр", "quantity": 1, "required": True},
            {"item_id": "Перчатки", "quantity": 2, "required": True},
            {"item_id": "Маска", "quantity": 2, "required": True},
            {"item_id": "Термометр", "quantity": 1, "required": True}
        ]
    },
    {
        "name": "Набор для желтого потока",
        "call_type": "Жёлтый поток",
        "description": "Набор для срочных вызовов",
        "items": [
            {"item_id": "Тонометр", "quantity": 1, "required": True},
            {"item_id": "Перчатки", "quantity": 4, "required": True},
            {"item_id": "Маска", "quantity": 4, "required": True},
            {"item_id": "Термометр", "quantity": 1, "required": True},
            {"item_id": "Бинт стерильный", "quantity": 2, "required": True},
            {"item_id": "Шприц 5мл", "quantity": 5, "required": True},
            {"item_id": "Анальгин", "quantity": 2, "required": False},
            {"item_id": "Натрия хлорид", "quantity": 1, "required": False}
        ]
    },
    {
        "name": "Набор для красного потока",
        "call_type": "Красный поток",
        "description": "Набор для экстренных вызовов",
        "items": [
            {"item_id": "Тонометр", "quantity": 1, "required": True},
            {"item_id": "Перчатки", "quantity": 6, "required": True},
            {"item_id": "Маска", "quantity": 6, "required": True},
            {"item_id": "Термометр", "quantity": 1, "required": True},
            {"item_id": "Бинт стерильный", "quantity": 4, "required": True},
            {"item_id": "Шприц 5мл", "quantity": 10, "required": True},
            {"item_id": "Анальгин", "quantity": 4, "required": True},
            {"item_id": "Адреналин", "quantity": 2, "required": True},
            {"item_id": "Натрия хлорид", "quantity": 2, "required": True},
            {"item_id": "Ножницы", "quantity": 1, "required": True},
            {"item_id": "Салфетки марлевые", "quantity": 4, "required": True}
        ]
    }
] 