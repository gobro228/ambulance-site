from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from bson import ObjectId

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