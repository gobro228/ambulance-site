from fastapi import FastAPI, HTTPException
from bson.objectid import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import CallModel, ResponseModel, InventoryItem, InventoryItemCreate, InventoryItemUpdate, InventoryUsage, InventoryUsageCreate
from .database import connect_to_db, close_db_connection
from datetime import datetime
import logging
import traceback

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
db = None  # База данных MongoDB
calls_collection = None  # Коллекция вызовов скорой помощи
inventory_collection = None  # Коллекция инвентаря

# Настройка CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL фронтенда
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

@app.middleware("http")
async def db_session_middleware(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Ошибка в middleware: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

# Функция для преобразования документа MongoDB в формат ответа API
def call_helper(call) -> dict:
    completed_at = call.get("completed_at")
    if completed_at:
        # Форматируем дату завершения в нужный формат
        completed_at = completed_at.strftime("%Y-%m-%d %H:%M:%S")

    # Форматируем дату вызова
    call_date = call["date"]
    if isinstance(call_date, datetime):
        call_date = call_date.strftime("%Y-%m-%d %H:%M:%S")

    # Получаем приоритет или устанавливаем значение по умолчанию
    priority = call.get("priority", "green")
    if not priority in ["green", "yellow", "red"]:
        priority = "green"  # Значение по умолчанию

    return {
        "id": str(call["_id"]),
        "fio": call["fio"],  # ФИО пациента
        "age": call["age"],  # Возраст пациента
        "address": call["address"],  # Адрес вызова
        "type": call["type"],  # Тип вызова (например, "Зелёный поток")
        "priority": priority,  # Приоритет вызова
        "date": call_date,  # Дата и время вызова
        "comment": call.get("comment", ""),  # Комментарий к вызову
        "status": call.get("status", "Принят"),  # Статус вызова
        "completed_at": completed_at  # Время завершения вызова
    }

# Создание нового вызова
@app.post("/calls/", response_model=ResponseModel)
async def create_call(call: CallModel):
    """
    Создание нового вызова скорой помощи.
    Принимает данные вызова и сохраняет их в базу данных.
    """
    call_dict = call.dict()
    
    # Преобразуем строку даты в объект datetime
    try:
        call_date = datetime.strptime(call_dict["date"], "%Y-%m-%d %H:%M:%S")
        call_dict["date"] = call_date
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Неверный формат даты. Используйте формат: YYYY-MM-DD HH:MM:SS"
        )
    
    new_call = await calls_collection.insert_one(call_dict)
    created_call = await calls_collection.find_one({"_id": new_call.inserted_id})
    if not created_call:
        raise HTTPException(status_code=500, detail="Ошибка при добавлении вызова в базу данных")
    return call_helper(created_call)

# Получение списка всех вызовов
@app.get("/calls/", response_model=list[ResponseModel])
async def get_calls():
    """
    Получение списка всех вызовов скорой помощи.
    Возвращает список всех вызовов из базы данных.
    """
    try:
        logger.info("Получение списка вызовов...")
        calls = []
        async for call in calls_collection.find():
            try:
                processed_call = call_helper(call)
                calls.append(processed_call)
            except Exception as e:
                logger.error(f"Ошибка при обработке вызова {call.get('_id')}: {str(e)}")
                logger.error(traceback.format_exc())
                continue
        logger.info(f"Успешно получено {len(calls)} вызовов")
        return calls
    except Exception as e:
        logger.error(f"Ошибка при получении списка вызовов: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при получении списка вызовов: {str(e)}"
        )

# Подключение к базе данных при запуске приложения
@app.on_event("startup")
async def startup():
    """
    Инициализация подключения к базе данных при запуске сервера.
    """
    global db, calls_collection, inventory_collection
    try:
        logger.info("Начинаем инициализацию базы данных...")
        db = await connect_to_db()
        if db is None:  # Правильная проверка на None
            raise Exception("Не удалось подключиться к базе данных")
        logger.info("База данных успешно подключена")
        calls_collection = db["calls"]
        inventory_collection = db["inventory"]
        logger.info("Коллекции calls и inventory инициализированы")
        
        # Проверяем подключение к базе данных
        await db.command("ping")
        logger.info("Подключение к базе данных проверено успешно")
    except Exception as e:
        logger.error(f"Ошибка при инициализации базы данных: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Закрытие соединения с базой данных при завершении работы
@app.on_event("shutdown")
async def shutdown():
    """
    Закрытие соединения с базой данных при остановке сервера.
    """
    await close_db_connection()

# Проверка работоспособности сервера
@app.get("/")
async def root():
    """
    Простой маршрут для проверки работоспособности сервера.
    """
    return {"message": "Сервер работает"}

# Обновление статуса вызова
@app.put("/calls/{call_id}/status")
async def update_call_status(call_id: str, status_update: dict):
    """
    Обновление статуса вызова скорой помощи.
    При установке статуса "Завершённый" автоматически фиксируется время завершения.
    
    Параметры:
    - call_id: ID вызова
    - status_update: словарь с новым статусом
    """
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Не указан статус")

    # Подготовка данных для обновления
    update_data = {"status": new_status}

    if new_status == "Завершённый":
        # Устанавливаем время завершения вызова
        current_time = datetime.now()
        update_data["completed_at"] = current_time

    # Обновляем запись в базе данных
    result = await calls_collection.update_one(
        {"_id": ObjectId(call_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Вызов не найден")

    return {
        "message": "Статус обновлён",
        "status": new_status,
        "completed_at": update_data.get("completed_at").strftime("%Y-%m-%d %H:%M:%S") if update_data.get("completed_at") else None
    }

# Удаление вызова
@app.delete("/calls/{call_id}")
async def delete_call(call_id: str):
    """
    Удаление вызова скорой помощи из базы данных.
    
    Параметры:
    - call_id: ID вызова для удаления
    """
    result = await calls_collection.delete_one({"_id": ObjectId(call_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Вызов не найден")
    return {"message": "Вызов успешно удалён"}

# Endpoints для работы с инвентарем
@app.get("/api/inventory/items")
async def get_inventory():
    """Получение списка всего инвентаря"""
    try:
        logger.info("Получаем список инвентаря...")
        if inventory_collection is None:
            logger.error("Коллекция инвентаря не инициализирована")
            return JSONResponse(
                status_code=500,
                content={"detail": "Коллекция инвентаря не инициализирована"}
            )
        
        logger.info("Выполняем запрос к коллекции inventory...")
        items = await inventory_collection.find().to_list(1000)
        logger.info(f"Найдено {len(items)} предметов")
        
        # Преобразуем ObjectId в строки для корректной сериализации
        for item in items:
            item["_id"] = str(item["_id"])
        
        return items
    except Exception as e:
        logger.error(f"Ошибка при получении инвентаря: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/api/inventory/categories")
async def get_inventory_categories():
    """Получение списка категорий инвентаря"""
    try:
        logger.info("Получаем список категорий...")
        if db is None:  # Правильная проверка на None
            logger.error("База данных не инициализирована")
            return JSONResponse(
                status_code=500,
                content={"detail": "База данных не инициализирована"}
            )
        
        logger.info("Выполняем запрос к коллекции inventory_categories...")
        categories = await db.inventory_categories.find().to_list(100)
        logger.info(f"Найдено {len(categories)} категорий")
        
        # Преобразуем ObjectId в строки для корректной сериализации
        for category in categories:
            category["_id"] = str(category["_id"])
        
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/api/inventory/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: str):
    """Получение информации о конкретном предмете инвентаря"""
    db = app.state.db
    item = await db.inventory_items.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    return item

@app.post("/api/inventory/items")
async def create_inventory_item(item: InventoryItemCreate):
    """Создание нового предмета инвентаря"""
    try:
        new_item = item.dict()
        new_item["created_at"] = datetime.now()
        new_item["updated_at"] = datetime.now()
        
        result = await inventory_collection.insert_one(new_item)
        created_item = await inventory_collection.find_one({"_id": result.inserted_id})
        
        if created_item:
            created_item["_id"] = str(created_item["_id"])
            return created_item
        else:
            raise HTTPException(status_code=500, detail="Не удалось создать предмет")
    except Exception as e:
        logger.error(f"Ошибка при создании предмета: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItemUpdate):
    """Обновление информации о предмете инвентаря"""
    db = app.state.db
    update_data = item.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.now()
    
    result = await db.inventory_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    
    updated_item = await db.inventory_items.find_one({"_id": ObjectId(item_id)})
    return updated_item

@app.get("/api/inventory/usage/{call_id}", response_model=list[InventoryUsage])
async def get_inventory_usage(call_id: str):
    """Получение информации об использовании инвентаря для конкретного вызова"""
    db = app.state.db
    usage = await db.inventory_usage.find({"call_id": ObjectId(call_id)}).to_list(1000)
    return usage

@app.post("/api/inventory/usage", response_model=InventoryUsage)
async def create_inventory_usage(usage: InventoryUsageCreate):
    """Добавление записи об использовании инвентаря"""
    db = app.state.db
    
    # Проверяем наличие достаточного количества инвентаря
    item = await db.inventory_items.find_one({"_id": ObjectId(usage.item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    
    if item["quantity"] < usage.quantity:
        raise HTTPException(status_code=400, detail="Недостаточное количество инвентаря")
    
    # Создаем запись об использовании
    usage_data = usage.dict()
    usage_data["used_at"] = datetime.now()
    result = await db.inventory_usage.insert_one(usage_data)
    
    # Обновляем количество инвентаря
    await db.inventory_items.update_one(
        {"_id": ObjectId(usage.item_id)},
        {"$inc": {"quantity": -usage.quantity}}
    )
    
    # Добавляем информацию в вызов
    await db.calls.update_one(
        {"_id": ObjectId(usage.call_id)},
        {
            "$push": {
                "inventory_used": {
                    "item_id": ObjectId(usage.item_id),
                    "quantity": usage.quantity,
                    "notes": usage.notes
                }
            }
        }
    )
    
    created_usage = await db.inventory_usage.find_one({"_id": result.inserted_id})
    return created_usage

# Endpoints для работы с наборами инвентаря
@app.get("/api/inventory/sets")
async def get_inventory_sets():
    """Получение списка всех наборов инвентаря"""
    try:
        logger.info("Получаем список наборов инвентаря...")
        if db is None:
            logger.error("База данных не инициализирована")
            return JSONResponse(
                status_code=500,
                content={"detail": "База данных не инициализирована"}
            )
        
        sets = await db.inventory_sets.find().to_list(100)
        for set_item in sets:
            set_item["_id"] = str(set_item["_id"])
        
        return sets
    except Exception as e:
        logger.error(f"Ошибка при получении наборов инвентаря: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/api/inventory/sets/{call_type}")
async def get_inventory_set_by_call_type(call_type: str):
    """Получение набора инвентаря для конкретного типа вызова"""
    try:
        logger.info(f"Получаем набор инвентаря для типа вызова: {call_type}")
        if db is None:
            logger.error("База данных не инициализирована")
            return JSONResponse(
                status_code=500,
                content={"detail": "База данных не инициализирована"}
            )
        
        inventory_set = await db.inventory_sets.find_one({"call_type": call_type})
        if inventory_set:
            inventory_set["_id"] = str(inventory_set["_id"])
            
            # Получаем детальную информацию о каждом предмете в наборе
            for item in inventory_set["items"]:
                inventory_item = await db.inventory_items.find_one({"_id": ObjectId(item["item_id"])})
                if inventory_item:
                    item["name"] = inventory_item["name"]
                    item["unit"] = inventory_item["unit"]
                    item["available"] = inventory_item["quantity"]
        
        return inventory_set or {"detail": "Набор не найден"}
    except Exception as e:
        logger.error(f"Ошибка при получении набора инвентаря: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.post("/api/inventory/items/{item_id}/replenish")
async def replenish_inventory_item(item_id: str, amount: dict):
    """Пополнение запаса товара на складе"""
    try:
        add_amount = amount.get("amount", 0)
        if not isinstance(add_amount, (int, float)) or add_amount <= 0:
            raise HTTPException(status_code=400, detail="Количество должно быть положительным числом")

        # Находим товар
        item = await inventory_collection.find_one({"_id": ObjectId(item_id)})
        if not item:
            raise HTTPException(status_code=404, detail="Товар не найден")

        # Обновляем количество
        new_quantity = item["quantity"] + add_amount
        result = await inventory_collection.update_one(
            {"_id": ObjectId(item_id)},
            {
                "$set": {
                    "quantity": new_quantity,
                    "updated_at": datetime.now()
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Не удалось обновить количество")

        # Получаем обновленный товар
        updated_item = await inventory_collection.find_one({"_id": ObjectId(item_id)})
        updated_item["_id"] = str(updated_item["_id"])
        return updated_item

    except Exception as e:
        logger.error(f"Ошибка при пополнении запаса: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
