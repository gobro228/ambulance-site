from pydantic import BaseModel, Field
from typing import Optional

class CallModel(BaseModel):
    fio: str = Field(..., example="Иван Иванов")
    age: int = Field(..., example=30)
    address: str = Field(..., example="ул. Пушкина, д. 1")
    type: str = Field(..., example="Зелёный поток")
    date: str = Field(..., example="2024-01-01T12:00:00")
    comment: Optional[str] = Field(None, example="Комментарий к вызову")
    status: str = Field("Принят", example="Принят")  # Статус по умолчанию
    completed_at: Optional[str] = Field(None, example="2024-01-01T15:30:00")  # Время завершения

class ResponseModel(CallModel):
    id: str = Field(..., example="647cdd6f72a7b4a8b4a6101c")
