from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from bson import ObjectId
from enum import Enum

class UnitEnum(str, Enum):
    PIECE = "шт"
    PACK = "уп"
    AMPOULE = "амп"
    PAIR = "пара"
    ML = "мл"
    BOTTLE = "фл"

class InventoryCategoryEnum(str, Enum):
    MEDICATIONS = "Медикаменты"
    DRESSINGS = "Перевязочные материалы"
    INSTRUMENTS = "Инструменты"
    EQUIPMENT = "Оборудование"
    CONSUMABLES = "Расходные материалы"
    SOLUTIONS = "Растворы"

class CallModel(BaseModel):
    """Модель для создания вызова"""
    fio: str = Field(..., description="ФИО пациента")
    age: int = Field(..., description="Возраст пациента")
    address: str = Field(..., description="Адрес вызова")
    type: str = Field(..., description="Тип вызова")
    priority: Literal["green", "yellow", "red"] = Field(..., description="Приоритет вызова")
    date: str = Field(..., description="Дата и время вызова")
    comment: Optional[str] = Field(None, description="Комментарий к вызову")

class ResponseModel(BaseModel):
    """Модель для ответа API"""
    id: str = Field(..., description="ID вызова")
    fio: str = Field(..., description="ФИО пациента")
    age: int = Field(..., description="Возраст пациента")
    address: str = Field(..., description="Адрес вызова")
    type: str = Field(..., description="Тип вызова")
    priority: Literal["green", "yellow", "red"] = Field(..., description="Приоритет вызова")
    date: str = Field(..., description="Дата и время вызова")
    comment: Optional[str] = Field(None, description="Комментарий к вызову")
    status: str = Field(default="Принят", description="Статус вызова")
    completed_at: Optional[str] = Field(None, description="Время завершения вызова")

    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S")
        }

class InventoryItemBase(BaseModel):
    """Базовая модель для инвентаря"""
    name: str = Field(..., description="Название предмета")
    description: str = Field(..., description="Описание предмета")
    category: str = Field(..., description="Категория предмета")
    unit: str = Field(..., description="Единица измерения")
    quantity: int = Field(..., description="Текущее количество")
    minimum_quantity: int = Field(..., description="Минимальное необходимое количество")

class InventoryItemCreate(InventoryItemBase):
    """Модель для создания нового предмета инвентаря"""
    pass

class InventoryItemUpdate(BaseModel):
    """Модель для обновления предмета инвентаря"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[int] = None
    minimum_quantity: Optional[int] = None

class InventoryItem(InventoryItemBase):
    """Полная модель предмета инвентаря"""
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class InventoryUsageBase(BaseModel):
    """Базовая модель для использования инвентаря"""
    item_id: str = Field(..., description="ID использованного предмета")
    call_id: str = Field(..., description="ID вызова")
    quantity: int = Field(..., description="Использованное количество")
    notes: Optional[str] = Field(None, description="Примечания")

class InventoryUsageCreate(InventoryUsageBase):
    """Модель для создания записи об использовании инвентаря"""
    pass

class InventoryUsage(InventoryUsageBase):
    """Полная модель использования инвентаря"""
    id: str = Field(alias="_id")
    used_at: datetime

    class Config:
        populate_by_name = True

# Фиксированный список инвентаря
EXAMPLE_INVENTORY = {
    InventoryCategoryEnum.MEDICATIONS: [
        {
            "name": "Анальгин",
            "description": "Анальгин 50%, 2мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Адреналин",
            "description": "Адреналин 0.1%, 1мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Преднизолон",
            "description": "Преднизолон 30мг/мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Дексаметазон",
            "description": "Дексаметазон 4мг/мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Кордиамин",
            "description": "Кордиамин 25%, 2мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Фуросемид",
            "description": "Фуросемид 1%, 2мл",
            "unit": UnitEnum.AMPOULE
        },
        {
            "name": "Димедрол",
            "description": "Димедрол 1%, 1мл",
            "unit": UnitEnum.AMPOULE
        }
    ],
    InventoryCategoryEnum.DRESSINGS: [
        {
            "name": "Бинт стерильный",
            "description": "Бинт марлевый стерильный 5м х 10см",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Салфетки марлевые",
            "description": "Салфетки марлевые стерильные 16х14см",
            "unit": UnitEnum.PACK
        },
        {
            "name": "Вата медицинская",
            "description": "Вата хирургическая стерильная 250г",
            "unit": UnitEnum.PACK
        },
        {
            "name": "Лейкопластырь",
            "description": "Лейкопластырь 2см х 5м",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Бинт эластичный",
            "description": "Бинт эластичный трубчатый 1м",
            "unit": UnitEnum.PIECE
        }
    ],
    InventoryCategoryEnum.INSTRUMENTS: [
        {
            "name": "Ножницы",
            "description": "Ножницы хирургические прямые 14см",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Пинцет",
            "description": "Пинцет хирургический 15см",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Зажим",
            "description": "Зажим кровоостанавливающий прямой 16см",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Языкодержатель",
            "description": "Языкодержатель для взрослых",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Роторасширитель",
            "description": "Роторасширитель для взрослых",
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
            "name": "Термометр",
            "description": "Термометр электронный",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Пульсоксиметр",
            "description": "Пульсоксиметр портативный",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Глюкометр",
            "description": "Глюкометр с тест-полосками",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Мешок Амбу",
            "description": "Мешок Амбу для взрослых",
            "unit": UnitEnum.PIECE
        }
    ],
    InventoryCategoryEnum.CONSUMABLES: [
        {
            "name": "Перчатки",
            "description": "Перчатки нитриловые нестерильные",
            "unit": UnitEnum.PAIR
        },
        {
            "name": "Маска",
            "description": "Маска медицинская одноразовая",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Шприц 2мл",
            "description": "Шприц одноразовый 2мл",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Шприц 5мл",
            "description": "Шприц одноразовый 5мл",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Шприц 10мл",
            "description": "Шприц одноразовый 10мл",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Катетер",
            "description": "Катетер внутривенный 18G",
            "unit": UnitEnum.PIECE
        },
        {
            "name": "Система для капельницы",
            "description": "Система для внутривенных вливаний",
            "unit": UnitEnum.PIECE
        }
    ],
    InventoryCategoryEnum.SOLUTIONS: [
        {
            "name": "Натрия хлорид",
            "description": "Натрия хлорид 0.9%, 200мл",
            "unit": UnitEnum.BOTTLE
        },
        {
            "name": "Глюкоза",
            "description": "Глюкоза 5%, 200мл",
            "unit": UnitEnum.BOTTLE
        },
        {
            "name": "Рингера раствор",
            "description": "Раствор Рингера, 200мл",
            "unit": UnitEnum.BOTTLE
        },
        {
            "name": "Реополиглюкин",
            "description": "Реополиглюкин 200мл",
            "unit": UnitEnum.BOTTLE
        }
    ]
} 