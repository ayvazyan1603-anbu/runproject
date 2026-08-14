import discord
from discord.ext import commands
from discord import app_commands
from aiohttp import web
import config
from database import save_verification

class VerifyPanelView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(
        label="🎮 Привязать Steam",
        style=discord.ButtonStyle.primary,
        custom_id="verify_steam_main_btn",
        emoji="🔗"
    )
    async def verify_click(self, interaction: discord.Interaction, button: discord.ui.Button):
        verify_url = f"{config.SITE_URL}/verify?discord_id={interaction.user.id}"
        
        embed = discord.Embed(
            title="🔗 Переход к верификации Steam",
            description=f"Привет, {interaction.user.mention}!\nНажмите кнопку ниже, чтобы войти через Steam на нашем сайте и автоматически привязать ваш аккаунт к Discord.",
            color=0x7c3aed
        )
        embed.set_footer(text="Ссылка персональная и привяжет именно ваш Discord ID.")

        view = discord.ui.View()
        view.add_item(discord.ui.Button(
            label="🌐 Авторизоваться через Steam",
            url=verify_url,
            style=discord.ButtonStyle.link
        ))

        await interaction.response.send_message(embed=embed, view=view, ephemeral=True)

    @discord.ui.button(
        label="❓ Зачем привязывать?",
        style=discord.ButtonStyle.secondary,
        custom_id="verify_info_btn",
        emoji="ℹ️"
    )
    async def info_click(self, interaction: discord.Interaction, button: discord.ui.Button):
        embed = discord.Embed(
            title="🛡️ Преимущества верификации Steam",
            description=(
                "Привязка Steam-аккаунта объединяет ваш профиль на сайте, игровом сервере и в Discord:\n\n"
                "• 🎖️ **Роль «Верифицирован»**: автоматическая выдача роли на сервере Discord.\n"
                "• 🛒 **Уведомления о покупках**: быстрые ЛС-уведомления о статусе ваучеров (`VIP`, `KHAN` и др.).\n"
                "• 📊 **Персональный профиль**: просмотр подробной статистики игрока командой `/profile`.\n"
                "• 🎁 **Эксклюзивные бонусы**: доступ к закрытым розыгрышам и промокодам проекта."
            ),
            color=0x3b82f6
        )
        await interaction.response.send_message(embed=embed, ephemeral=True)


class VerificationCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="send_verify_panel", description="[Админ] Отправить панель верификации в текущий канал")
    @app_commands.checks.has_permissions(administrator=True)
    async def send_verify_panel(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        embed = discord.Embed(
            title="🔗 ВЕРИФИКАЦИЯ STEAM — RUH PROJECT",
            description=(
                "Привяжите ваш Steam-аккаунт к Discord для получения роли **Верифицирован**, "
                "личных уведомлений о статусе ваучеров и доступа к полному функционалу проекта!\n\n"
                "**📌 Инструкция по верификации:**\n"
                "1️⃣ Нажмите кнопку **`🎮 Привязать Steam`** ниже.\n"
                "2️⃣ Нажмите **`🌐 Авторизоваться через Steam`** в открывшемся сообщении.\n"
                "3️⃣ Войдите на нашем сайте через официальный Steam OpenID.\n"
                "4️⃣ Готово! Роль **Верифицирован** выдастся автоматически за пару секунд."
            ),
            color=0x7c3aed
        )
        embed.set_footer(text="RUH PROJECT • Безопасная авторизация через Steam")

        view = VerifyPanelView()
        await interaction.channel.send(embed=embed, view=view)
        await interaction.followup.send("✅ Панель верификации успешно отправлена в канал!", ephemeral=True)


async def setup_verification_webhook(bot, pool, app):
    async def handle_verify(request):
        try:
            data = await request.json()
            discord_id = int(data['discord_id'])
            steamid = str(data['steamid'])
            player_name = data.get('player_name', 'Игрок')

            # Save in MySQL
            await save_verification(pool, discord_id, steamid)

            guild = bot.get_guild(config.GUILD_ID)
            if guild:
                member = guild.get_member(discord_id)
                if not member:
                    try:
                        member = await guild.fetch_member(discord_id)
                    except Exception:
                        member = None

                if member:
                    role = discord.utils.get(guild.roles, name="Верифицирован")
                    if not role:
                        try:
                            role = await guild.create_role(name="Верифицирован", color=discord.Color.purple(), reason="Роль верификации Steam")
                        except Exception as r_err:
                            print(f"Failed to auto-create role: {r_err}")

                    if role:
                        await member.add_roles(role)

                    try:
                        await member.send(f"✅ Ваш Steam аккаунт (**{player_name}** | `{steamid}`) успешно привязан к Discord! Вам выдана роль **Верифицирован**.")
                    except Exception as err:
                        print(f"Failed to DM member {discord_id}: {err}")

            return web.json_response({"success": True})
        except Exception as e:
            print("Webhook verify error:", e)
            return web.json_response({"success": False, "error": str(e)}, status=500)

    app.router.add_post('/webhook/verify', handle_verify)


async def setup(bot):
    await bot.add_cog(VerificationCog(bot))
