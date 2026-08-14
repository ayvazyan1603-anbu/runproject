import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import discord
from discord.ext import commands
from aiohttp import web
import config
from database import get_pool
from cogs.orders import setup_orders_webhook
from cogs.verification import setup_verification_webhook

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
pool = None

@bot.event
async def on_ready():
    global pool
    pool = await get_pool()
    bot.pool = pool

    # Load cogs
    await bot.load_extension('cogs.orders')
    await bot.load_extension('cogs.verification')
    await bot.load_extension('cogs.profile')
    await bot.load_extension('cogs.tickets')

    # Register persistent views
    from cogs.tickets import TicketCloseView
    from cogs.verification import VerifyPanelView
    bot.add_view(TicketCloseView())
    bot.add_view(VerifyPanelView())

    # Sync slash commands
    try:
        synced = await bot.tree.sync()
        print(f"✅ Успешно синхронизировано {len(synced)} Slash-команд.")
    except Exception as e:
        print(f"❌ Ошибка синхронизации Slash-команд: {e}")

    print(f"🚀 Бот RUH PROJECT запущен: {bot.user} (ID: {bot.user.id})")

# Webhook server
app = web.Application()

async def start_webhook():
    await setup_orders_webhook(bot, pool, app)
    await setup_verification_webhook(bot, pool, app)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', config.WEBHOOK_PORT)
    await site.start()
    print(f"📡 Webhook сервер запущен на http://localhost:{config.WEBHOOK_PORT}")

async def main():
    if not config.TOKEN or config.TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("\n❌ ОШИБКА: Не указан токен Discord бота!")
        print("📌 Вставьте токен вашего бота в файл bot/config.py (переменная TOKEN = \"...\") или в bot/.env (DISCORD_BOT_TOKEN=...)\n")
        return

    async with bot:
        global pool
        pool = await get_pool()
        bot.pool = pool
        
        await start_webhook()
        try:
            await bot.start(config.TOKEN)
        finally:
            if pool:
                pool.close()
                await pool.wait_closed()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Бот остановлен.")
    except discord.errors.LoginFailure:
        print("\n❌ ОШИБКА АВТОРИЗАЦИИ: Передан неверный токен Discord бота!")
        print("📌 Проверьте токен в bot/config.py или bot/.env\n")
    except Exception as e:
        print(f"\n❌ Ошибка при работе бота: {e}")
