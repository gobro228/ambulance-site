from enum import Enum
from .models import (
    CallModel, ResponseModel,
    InventoryItem, InventoryItemCreate, InventoryItemUpdate,
    InventoryUsage, InventoryUsageCreate
)

class InventoryCategoryEnum(Enum):
    MEDICATIONS = "Медикаменты"
    BANDAGES = "Перевязочные материалы"
    INSTRUMENTS = "Инструменты"
    EQUIPMENT = "Оборудование"
    CONSUMABLES = "Расходные материалы"

# Примеры инвентаря для каждой категории
EXAMPLE_INVENTORY = {
    InventoryCategoryEnum.MEDICATIONS: [
        {
            "name": "analgin",
            "description": "Анальгин, раствор для инъекций",
            "unit": "ампула"
        },
        {
            "name": "adrenaline",
            "description": "Адреналин, раствор для инъекций",
            "unit": "ампула"
        },
        {
            "name": "sodium_chloride",
            "description": "Натрия хлорид 0.9%, раствор",
            "unit": "флакон"
        }
    ],
    InventoryCategoryEnum.BANDAGES: [
        {
            "name": "bandage",
            "description": "Бинт марлевый стерильный",
            "unit": "шт"
        },
        {
            "name": "gauze",
            "description": "Марля медицинская",
            "unit": "упаковка"
        }
    ],
    InventoryCategoryEnum.INSTRUMENTS: [
        {
            "name": "scissors",
            "description": "Ножницы медицинские",
            "unit": "шт"
        },
        {
            "name": "tonometer",
            "description": "Тонометр механический",
            "unit": "шт"
        },
        {
            "name": "thermometer",
            "description": "Термометр электронный",
            "unit": "шт"
        }
    ],
    InventoryCategoryEnum.CONSUMABLES: [
        {
            "name": "gloves",
            "description": "Перчатки медицинские нестерильные",
            "unit": "пара"
        },
        {
            "name": "mask",
            "description": "Маска медицинская одноразовая",
            "unit": "шт"
        },
        {
            "name": "syringe",
            "description": "Шприц одноразовый 5мл",
            "unit": "шт"
        }
    ]
}

from .inventory_sets import DEFAULT_INVENTORY_SETS

__all__ = [
    'CallModel',
    'ResponseModel',
    'InventoryItem',
    'InventoryItemCreate',
    'InventoryItemUpdate',
    'InventoryUsage',
    'InventoryUsageCreate',
    'InventoryCategoryEnum',
    'EXAMPLE_INVENTORY',
    'DEFAULT_INVENTORY_SETS'
] 