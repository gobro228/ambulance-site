from fastapi import FastAPI, HTTPException
from bson.objectid import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from .models import CallModel, ResponseModel
from .database import connect_to_db, close_db_connection

app = FastAPI()
db = None  # Переменная для базы данных
calls_collection = None  # Переменная для коллекции "calls"

# Настройка CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],  # Разрешить все заголовки
)

# Хелпер для преобразования документов MongoDB
def call_helper(call) -> dict:
    return {
        "id": str(call["_id"]),
        "fio": call["fio"],
        "age": call["age"],
        "address": call["address"],
        "type": call["type"],
        "date": call["date"],
        "comment": call.get("comment", ""),
        "status": call.get("status", "Принят"),
        "completed_at": call["completed_at"],
    }

# Создание вызова
@app.post("/calls/", response_model=ResponseModel)
async def create_call(call: CallModel):
    call_dict = call.dict()
    new_call = await calls_collection.insert_one(call_dict)
    created_call = await calls_collection.find_one({"_id": new_call.inserted_id})
    if not created_call:
        raise HTTPException(status_code=500, detail="Ошибка при добавлении вызова в базу данных")
    return call_helper(created_call)

# Получение всех вызовов
@app.get("/calls/", response_model=list[ResponseModel])
async def get_calls():
    calls = []
    async for call in calls_collection.find():
        calls.append(call_helper(call))
    return calls

# Подключение к базе данных при старте
@app.on_event("startup")
async def startup():
    global db, calls_collection
    db = await connect_to_db()
    calls_collection = db["calls"]

# Отключение от базы данных при завершении
@app.on_event("shutdown")
async def shutdown():
    await close_db_connection()

# Пример маршрута для проверки
@app.get("/")
async def root():
    return {"message": "Приложение работает"}

from datetime import datetime

# Обновление статуса вызова
@app.put("/calls/{call_id}/status")
async def update_call_status(call_id: str, status_update: dict):
    """
    Обновление статуса вызова.
    Если статус становится "Завершённый", фиксируем время завершения.
    """
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Не указан статус")

    # Обновляем статус и фиксируем время завершения, если статус "Завершённый"
    update_data = {"status": new_status}

    if new_status == "Завершённый":
        update_data["completed_at"] = datetime.utcnow() # исправить дату!!!!!!!!!!!!!!!!!!!!!!!!!
        print(f"Добавляем completed_at: {update_data['completed_at']}")  # Логируем время завершения


    result = await calls_collection.update_one(
        {"_id": ObjectId(call_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Вызов не найден")

    return {
    "message": "Статус обновлён",
    "status": new_status,
    "completed_at": update_data.get("completed_at")
    }

@app.delete("/calls/{call_id}")
async def delete_call(call_id: str):
    result = await calls_collection.delete_one({"_id": ObjectId(call_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Вызов не найден")
    return {"message": "Вызов успешно удалён"}
