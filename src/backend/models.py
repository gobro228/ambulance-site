from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class CallModel(BaseModel):
    """
    Модель данных для вызова скорой помощи.
    Содержит все необходимые поля для создания и обработки вызова.
    """
    fio: str = Field(..., example="Иван Иванов")  # ФИО пациента
    age: int = Field(..., example=30)  # Возраст пациента
    address: str = Field(..., example="ул. Пушкина, д. 1")  # Адрес вызова
    type: str = Field(..., example="Зелёный поток")  # Тип вызова
    date: datetime = Field(..., example="2024-03-15 10:00:00")  # Дата и время вызова
    comment: Optional[str] = Field(None, example="Комментарий к вызову")  # Дополнительные заметки
    status: str = Field("Принят", example="Принят")  # Текущий статус вызова
    completed_at: Optional[datetime] = Field(None, example="2024-03-15 13:30:00")  # Время завершения вызова

class ResponseModel(CallModel):
    """
    Модель ответа API, расширяет CallModel.
    Добавляет поле id для идентификации вызова в базе данных.
    """
    id: str = Field(..., example="647cdd6f72a7b4a8b4a6101c")  # Уникальный идентификатор вызова

# Новые модели для инвентаря

class InventoryCategoryEnum(str, Enum):
    MEDICATIONS = "Медикаменты"
    DRESSINGS = "Перевязочные материалы"
    INSTRUMENTS = "Инструменты"
    EQUIPMENT = "Оборудование"
    CONSUMABLES = "Расходные материалы"

class UnitEnum(str, Enum):
    PIECE = "шт"
    PACK = "уп"
    ML = "мл"
    MG = "мг"
    AMPOULE = "амп"

class InventoryItemBase(BaseModel):
    name: str = Field(..., description="Название предмета")
    description: str = Field(..., description="Описание предмета")
    category: InventoryCategoryEnum = Field(..., description="Категория предмета")
    unit: UnitEnum = Field(..., description="Единица измерения")
    quantity: int = Field(..., description="Текущее количество")
    minimum_quantity: int = Field(..., description="Минимальное допустимое количество")

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[InventoryCategoryEnum] = None
    unit: Optional[UnitEnum] = None
    quantity: Optional[int] = None
    minimum_quantity: Optional[int] = None

class InventoryItem(InventoryItemBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str  # Конвертируем ObjectId в строку
        }
        schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Бинт",
                "description": "Бинт марлевый стерильный 5м x 10см",
                "category": "Перевязочные материалы",
                "unit": "шт",
                "quantity": 100,
                "minimum_quantity": 20,
                "created_at": "2024-03-15T10:00:00",
                "updated_at": "2024-03-15T10:00:00"
            }
        }

class InventoryUsageBase(BaseModel):
    item_id: str
    call_id: str
    quantity: int
    notes: Optional[str] = None

class InventoryUsageCreate(InventoryUsageBase):
    pass

class InventoryUsage(InventoryUsageBase):
    id: str = Field(alias="_id")
    used_at: datetime

    class Config:
        allow_population_by_field_name = True

# Примеры инвентаря для инициализации
EXAMPLE_INVENTORY = {
    InventoryCategoryEnum.MEDICATIONS: [
        {
            "name": "Анальгин",
            "description": "Анальгин 50% 2мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Кордиамин",
            "description": "Кордиамин 25% 2мл",
            "unit": UnitEnum.AMPOULE
        }
    ],
    InventoryCategoryEnum.DRESSINGS: [
        {
            "name": "Бинт",
            "description": "Бинт марлевый стерильный 5м x 10см",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Салфетки",
            "description": "Салфетки марлевые стерильные 16x14см",
            "unit": UnitEnum.PACK
        }
    ],
    InventoryCategoryEnum.INSTRUMENTS: [
        {
            "name": "Ножницы",
            "description": "Ножницы хирургические прямые",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Пинцет",
            "description": "Пинцет хирургический общего назначения",
            "unit": UnitEnum.PIECE
        }
    ],
    InventoryCategoryEnum.EQUIPMENT: [
        {
            "name": "Тонометр",
            "description": "Тонометр механический со стетоскопом",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Глюкометр",
            "description": "Глюкометр портативный",
            "unit": UnitEnum.PIECE
        }
    ],
    InventoryCategoryEnum.CONSUMABLES: [
        {
            "name": "Перчатки",
            "description": "Перчатки нитриловые нестерильные",
            "unit": UnitEnum.PACK
        },
        {
            "name": "Шприцы",
            "description": "Шприц одноразовый 5мл",
            "unit": UnitEnum.PIECE
        }
    ]
}
