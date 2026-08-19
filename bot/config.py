import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("DISCORD_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
GUILD_ID = int(os.getenv("DISCORD_GUILD_ID", "0"))
ORDERS_CHANNEL_ID = int(os.getenv("DISCORD_ORDERS_CHANNEL_ID", "0"))
LOG_CHANNEL_ID = int(os.getenv("DISCORD_LOG_CHANNEL_ID", "0"))

DB_HOST = os.getenv("DB_HOST", "u13.joingame.kz")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "sql_9326_free")
DB_USER = os.getenv("DB_USER", "sql_9326_free")
DB_PASSWORD = os.getenv("DB_PASSWORD", "KkrmQZqkfL")

VOUCHER_PRICES = {
    "VIP": 2999,
    "BATYR": 4999,
    "KHAN": 7999,
    "SULTAN": 9999,
    "RUH": 14999
}

SITE_URL = os.getenv("VITE_SITE_URL", "http://localhost:8080")
WEBHOOK_PORT = int(os.getenv("PORT", os.getenv("WEBHOOK_PORT", "5000")))
