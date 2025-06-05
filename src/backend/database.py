from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from .models import EXAMPLE_INVENTORY, InventoryCategoryEnum, DEFAULT_INVENTORY_SETS
from datetime import datetime
import random

# Настройки подключения к MongoDB
MONGO_URI = "mongodb://localhost:27017"  # URI для подключения к базе данных
DATABASE_NAME = "ambulance"  # Название базы данных

# Глобальные переменные
client = None
db = None

async def setup_inventory_collections(database):
    """
    Настройка коллекций для инвентаря.
    Создает необходимые коллекции и индексы, если они еще не существуют.
    """
    # Создаем индексы для инвентаря
    await database.inventory_categories.create_index("name", unique=True)
    await database.inventory_items.create_index("name")
    await database.inventory_items.create_index("category")
    await database.inventory_items.create_index([("quantity", 1)])
    
    # Создаем индексы для использования инвентаря
    await database.inventory_usage.create_index([("call_id", 1)])
    await database.inventory_usage.create_index([("item_id", 1)])
    await database.inventory_usage.create_index([("used_at", -1)])
    
    # Добавляем индекс для вызовов с инвентарем
    await database.calls.create_index([("inventory_used.item_id", 1)])

async def init_inventory_data(database):
    """
    Инициализация данных инвентаря.
    Добавляет категории и базовые позиции, если их еще нет.
    """
    print("Начинаем инициализацию данных инвентаря...")
    
    # Добавляем категории
    for category in InventoryCategoryEnum:
        try:
            result = await database.inventory_categories.update_one(
                {"name": category.value},
                {
                    "$setOnInsert": {
                        "name": category.value,
                        "description": f"Категория {category.value.lower()}",
                        "created_at": datetime.now()
                    }
                },
                upsert=True
            )
            if result.upserted_id:
                print(f"Добавлена новая категория: {category.value}")
            else:
                print(f"Категория {category.value} уже существует")
        except Exception as e:
            print(f"Ошибка при добавлении категории {category.value}: {e}")

    # Добавляем примеры инвентаря
    print("\nДобавляем примеры инвентаря...")
    for category, items in EXAMPLE_INVENTORY.items():
        for item in items:
            try:
                result = await database.inventory_items.update_one(
                    {
                        "name": item["name"],
                        "category": category.value
                    },
                    {
                        "$setOnInsert": {
                            "category": category.value,
                            "name": item["name"],
                            "description": item["description"],
                            "unit": item["unit"],
                            "quantity": 100,
                            "minimum_quantity": 20,
                            "created_at": datetime.now(),
                            "updated_at": datetime.now()
                        }
                    },
                    upsert=True
                )
                if result.upserted_id:
                    print(f"Добавлен новый предмет: {item['name']}")
                else:
                    print(f"Предмет {item['name']} уже существует")
            except Exception as e:
                print(f"Ошибка при добавлении инвентаря {item['name']}: {e}")

    # Добавляем наборы инвентаря
    print("\nДобавляем наборы инвентаря...")
    for inventory_set in DEFAULT_INVENTORY_SETS:
        try:
            # Получаем ID предметов по их названиям
            for item in inventory_set["items"]:
                inventory_item = await database.inventory_items.find_one({"name": item["item_id"]})
                if inventory_item:
                    item["item_id"] = str(inventory_item["_id"])

            result = await database.inventory_sets.update_one(
                {
                    "name": inventory_set["name"],
                    "call_type": inventory_set["call_type"]
                },
                {
                    "$setOnInsert": {
                        **inventory_set,
                        "created_at": datetime.now(),
                        "updated_at": datetime.now()
                    }
                },
                upsert=True
            )
            if result.upserted_id:
                print(f"Добавлен новый набор: {inventory_set['name']}")
            else:
                print(f"Набор {inventory_set['name']} уже существует")
        except Exception as e:
            print(f"Ошибка при добавлении набора {inventory_set['name']}: {e}")

    print("\nИнициализация данных инвентаря завершена")

async def init_inventory_usage(database):
    """
    Инициализация данных об использовании инвентаря.
    Добавляет примеры использования инвентаря для существующих вызовов.
    """
    # Получаем все вызовы без записей об использовании инвентаря
    # Используем $or для поиска вызовов где inventory_used отсутствует или пуст
    async for call in database.calls.find({
        "$or": [
            {"inventory_used": {"$exists": False}},
            {"inventory_used": {"$size": 0}},
            {"inventory_used": []}
        ]
    }):
        try:
            # Получаем случайные предметы инвентаря (от 1 до 3)
            items_cursor = database.inventory_items.aggregate([{"$sample": {"size": random.randint(1, 3)}}])
            used_items = []
            
            async for item in items_cursor:
                # Генерируем случайное количество использованного инвентаря
                quantity_used = random.randint(1, 5)
                
                # Создаем запись об использовании
                usage_record = {
                    "item_id": item["_id"],
                    "call_id": call["_id"],
                    "quantity": quantity_used,
                    "used_at": call.get("created_at", datetime.now()),
                    "notes": f"Использовано при вызове {call.get('patient_name', 'Пациент')}"
                }
                
                try:
                    # Добавляем запись в коллекцию использования
                    await database.inventory_usage.insert_one(usage_record)
                    print(f"Добавлена запись об использовании для вызова {call['_id']}")
                    
                    # Добавляем информацию об использовании в вызов
                    used_items.append({
                        "item_id": item["_id"],
                        "name": item["name"],
                        "quantity": quantity_used,
                        "unit": item["unit"]
                    })
                    
                    # Обновляем количество оставшегося инвентаря
                    await database.inventory_items.update_one(
                        {"_id": item["_id"]},
                        {"$inc": {"quantity": -quantity_used}}
                    )
                except Exception as e:
                    print(f"Ошибка при добавлении записи об использовании: {e}")
            
            # Обновляем вызов, добавляя использованный инвентарь
            if used_items:
                await database.calls.update_one(
                    {"_id": call["_id"]},
                    {"$set": {"inventory_used": used_items}}
                )
                print(f"Обновлен вызов {call['_id']} с использованным инвентарем")
        except Exception as e:
            print(f"Ошибка при обработке вызова {call['_id']}: {e}")

async def connect_to_db():
    """
    Подключение к MongoDB.
    Устанавливает соединение с базой данных и инициализирует необходимые коллекции.
    
    Возвращает:
        AsyncIOMotorDatabase: Объект базы данных для асинхронной работы
    
    Вызывает:
        ConnectionFailure: Если не удалось подключиться к базе данных
    """
    global client, db
    try:
        print("\nПодключение к MongoDB...")
        client = AsyncIOMotorClient(MONGO_URI)
        # Проверяем подключение
        await client.admin.command('ping')
        print("Успешное подключение к MongoDB")
        
        db = client[DATABASE_NAME]
        print(f"Используется база данных: {DATABASE_NAME}")
        
        # Настраиваем коллекции для инвентаря
        print("\nНастройка коллекций...")
        await setup_inventory_collections(db)
        
        # Инициализируем данные инвентаря
        await init_inventory_data(db)
        
        # Инициализируем данные об использовании инвентаря
        print("\nИнициализация данных об использовании инвентаря...")
        await init_inventory_usage(db)
        
        print("\nИнициализация базы данных успешно завершена")
        return db
    except ConnectionFailure as e:
        print(f"Не удалось подключиться к MongoDB: {e}")
        raise
    except Exception as e:
        print(f"Произошла ошибка при подключении к MongoDB: {e}")
        raise

async def close_db_connection():
    """
    Закрытие соединения с MongoDB.
    Освобождает ресурсы и корректно завершает работу с базой данных.
    """
    global client
    if client:
        client.close()
        print("Соединение с MongoDB закрыто")
