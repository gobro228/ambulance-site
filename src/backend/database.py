from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "ambulance"

client = None

async def connect_to_db():
    """
    Подключение к MongoDB.
    """
    global client
    client = AsyncIOMotorClient(MONGO_URI)
    return client[DATABASE_NAME]

async def close_db_connection():
    """
    Закрытие соединения с MongoDB.
    """
    global client
    if client:
        client.close()
