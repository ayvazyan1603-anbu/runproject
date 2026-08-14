import discord
from discord.ext import commands
from aiohttp import web
import config
from database import grant_vip, update_order_status

class OrderView(discord.ui.View):
    def __init__(self, bot, pool, order_id: int, steamid: str, voucher: str, discord_id: int = None):
        super().__init__(timeout=None)
        self.bot = bot
        self.pool = pool
        self.order_id = order_id
        self.steamid = steamid
        self.voucher = voucher
        self.discord_id = discord_id

    @discord.ui.button(label="✅ Подтвердить", style=discord.ButtonStyle.green, custom_id="order_confirm")
    async def confirm(self, interaction: discord.Interaction, button: discord.ui.Button):
        try:
            await interaction.response.defer()
            
            # Grant VIP in MySQL database
            if self.pool:
                await grant_vip(self.pool, self.steamid, self.voucher, 30)
                if self.order_id:
                    await update_order_status(self.pool, self.order_id, 'approved')
            
            # Update Discord Embed
            embed = interaction.message.embeds[0]
            embed.color = 0x00ff00
            embed.add_field(name="Статус", value=f"✅ Подтверждено — {interaction.user.name}", inline=False)

            for item in self.children:
                item.disabled = True

            await interaction.message.edit(embed=embed, view=self)
            await interaction.followup.send(f"✅ Ваучер **{self.voucher}** успешно выдан игроку **{self.steamid}**", ephemeral=True)

            # Notify player in DM if verified
            if self.discord_id:
                try:
                    user = await self.bot.fetch_user(int(self.discord_id))
                    if user:
                        await user.send(f"✅ Ваш ваучер **{self.voucher}** успешно активирован на 30 дней! Приятной игры на сервере RUH PROJECT.")
                except Exception as e:
                    print(f"Failed to DM user {self.discord_id}: {e}")

        except Exception as err:
            print(f"Error in order confirm: {err}")
            try:
                await interaction.followup.send(f"❌ Ошибка подтверждения заявки: {err}", ephemeral=True)
            except Exception:
                pass

    @discord.ui.button(label="❌ Отклонить", style=discord.ButtonStyle.red, custom_id="order_reject")
    async def reject(self, interaction: discord.Interaction, button: discord.ui.Button):
        try:
            await interaction.response.defer()
            
            if self.pool and self.order_id:
                await update_order_status(self.pool, self.order_id, 'rejected')
            
            # Update Discord Embed
            embed = interaction.message.embeds[0]
            embed.color = 0xff0000
            embed.add_field(name="Статус", value=f"❌ Отклонено — {interaction.user.name}", inline=False)

            for item in self.children:
                item.disabled = True

            await interaction.message.edit(embed=embed, view=self)
            await interaction.followup.send(f"❌ Заявка #{self.order_id} отклонена.", ephemeral=True)

            # Notify player in DM
            if self.discord_id:
                try:
                    user = await self.bot.fetch_user(int(self.discord_id))
                    if user:
                        await user.send(f"❌ Ваша оплата за ваучер **{self.voucher}** была отклонена. Если вы считаете что это ошибка, обратитесь к администратору.")
                except Exception as e:
                    print(f"Failed to DM user {self.discord_id}: {e}")

        except Exception as err:
            print(f"Error in order reject: {err}")
            try:
                await interaction.followup.send(f"❌ Ошибка отклонения заявки: {err}", ephemeral=True)
            except Exception:
                pass


import os

class OrdersCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

async def setup_orders_webhook(bot, pool, app):
    async def handle_order(request):
        try:
            data = await request.json()
            order_id = data.get('order_id', 0)
            steamid = data['steamid']
            voucher = data['voucher']
            price = data['price']
            screenshot_url = data.get('screenshot_url')
            screenshot_path = data.get('screenshot_path')
            player_name = data.get('player_name', 'Игрок')
            discord_id = data.get('discord_id')

            channel_id = config.ORDERS_CHANNEL_ID
            channel = bot.get_channel(channel_id)
            
            if not channel:
                print(f"Error: ORDERS_CHANNEL_ID {channel_id} not found!")
                return web.json_response({"success": False, "error": "Orders channel not found"}, status=500)

            embed = discord.Embed(
                title="🛒 Новая заявка на ваучер (Kaspi Оплата)",
                color=0x7c3aed
            )
            embed.add_field(name="Игрок", value=player_name, inline=True)
            embed.add_field(name="SteamID", value=steamid, inline=True)
            embed.add_field(name="Ваучер", value=voucher, inline=True)
            embed.add_field(name="Сумма оплаты", value=f"{price} ₸", inline=True)

            discord_file = None
            if screenshot_path and os.path.exists(screenshot_path):
                discord_file = discord.File(screenshot_path, filename="kaspi_receipt.png")
                embed.set_image(url="attachment://kaspi_receipt.png")
            elif screenshot_url:
                embed.set_image(url=screenshot_url)

            embed.set_footer(text=f"Discord ID: {discord_id if discord_id else 'не верифицирован'} | Order #{order_id}")

            view = OrderView(
                bot=bot,
                pool=pool,
                order_id=order_id,
                steamid=steamid,
                voucher=voucher,
                discord_id=discord_id
            )

            if discord_file:
                await channel.send(embed=embed, file=discord_file, view=view)
            else:
                await channel.send(embed=embed, view=view)

            return web.json_response({"success": True})
        except Exception as e:
            print("Webhook order processing error:", e)
            return web.json_response({"success": False, "error": str(e)}, status=500)

    app.router.add_post('/webhook/order', handle_order)

async def setup(bot):
    await bot.add_cog(OrdersCog(bot))
