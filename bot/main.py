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

# Use default intents to ensure bot works even without Privileged Intents enabled in Dev Portal
intents = discord.Intents.default()
try:
    intents.members = True
except Exception:
    pass

class RuhBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)
        self.pool = None
        self.web_app = web.Application()

    async def setup_hook(self):
        # Initialize database pool
        try:
            self.pool = await get_pool()
            print("💾 База данных MySQL успешно подключена.")
        except Exception as db_err:
            print(f"⚠️ Ошибка подключения к MySQL: {db_err}")

        # Load all cogs
        for ext in ['cogs.orders', 'cogs.verification', 'cogs.profile', 'cogs.tickets']:
            try:
                await self.load_extension(ext)
                print(f"📦 Загружен модуль: {ext}")
            except Exception as e:
                print(f"❌ Ошибка загрузки модуля {ext}: {e}")

        # Register persistent views
        try:
            from cogs.tickets import TicketCloseView
            from cogs.verification import VerifyPanelView
            self.add_view(TicketCloseView())
            self.add_view(VerifyPanelView())
        except Exception as v_err:
            print(f"⚠️ Ошибка регистрации Views: {v_err}")

        # Setup and start Webhook HTTP server
        try:
            await setup_orders_webhook(self, self.pool, self.web_app)
            await setup_verification_webhook(self, self.pool, self.web_app)

            runner = web.AppRunner(self.web_app)
            await runner.setup()
            port = int(getattr(config, 'WEBHOOK_PORT', 5000) or 5000)
            site = web.TCPSite(runner, '0.0.0.0', port)
            await site.start()
            print(f"📡 Webhook сервер запущен на http://0.0.0.0:{port}")
        except Exception as w_err:
            print(f"❌ Ошибка запуска Webhook сервера: {w_err}")

    async def on_ready(self):
        print(f"🚀 Бот RUH PROJECT запущен: {self.user} (ID: {self.user.id})")
        # Sync slash commands
        try:
            synced = await self.tree.sync()
            print(f"✅ Успешно синхронизировано {len(synced)} Slash-команд.")
        except Exception as e:
            print(f"❌ Ошибка синхронизации Slash-команд: {e}")

    async def close(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()
        await super().close()

bot = RuhBot()

async def run_bot():
    token = getattr(config, 'TOKEN', None)
    if not token or token == "YOUR_BOT_TOKEN_HERE":
        print("\n❌ ОШИБКА: Не указан токен Discord бота!")
        print("📌 Укажите переменную окружения DISCORD_BOT_TOKEN\n")
        return

    try:
        await bot.start(token)
    except discord.errors.PrivilegedIntentsRequired:
        print("\n⚠️ ВНИМАНИЕ: Discord требует включить 'Server Members Intent'. Перезапуск со стандартными правами...")
        # Fallback to standard default intents without members intent
        fallback_intents = discord.Intents.default()
        fallback_bot = RuhBot()
        fallback_bot.intents = fallback_intents
        await fallback_bot.start(token)
    except discord.errors.LoginFailure:
        print("\n❌ ОШИБКА АВТОРИЗАЦИИ: Передан неверный токен Discord бота!")
    except Exception as e:
        print(f"\n❌ Ошибка при работе бота: {e}")

if __name__ == '__main__':
    try:
        asyncio.run(run_bot())
    except KeyboardInterrupt:
        print("\n🛑 Бот остановлен.")
