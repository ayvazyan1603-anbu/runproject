import discord
from discord import app_commands
from discord.ext import commands
import config
from database import get_bot_config, save_bot_config

class SetupModal(discord.ui.Modal, title="⚙️ Настройка параметров тикетов"):
    title_input = discord.ui.TextInput(
        label="Заголовок Эмбеда Панели",
        placeholder="🎫 Служба поддержки RUH PROJECT",
        default="🎫 Служба поддержки RUH PROJECT",
        required=True
    )
    desc_input = discord.ui.TextInput(
        label="Описание Панели",
        style=discord.TextStyle.paragraph,
        placeholder="Нажмите кнопку ниже чтобы создать приватный тикет...",
        default="Нужна помощь администратора или возник вопрос по ваучерам? Нажмите кнопку ниже для создания тикета.",
        required=True
    )
    btn_label_input = discord.ui.TextInput(
        label="Текст Кнопки Создания",
        placeholder="📩 Создать тикет",
        default="📩 Создать тикет",
        required=True
    )

    def __init__(self, bot, pool):
        super().__init__()
        self.bot = bot
        self.pool = pool

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        
        await save_bot_config(self.pool, "ticket_title", self.title_input.value)
        await save_bot_config(self.pool, "ticket_desc", self.desc_input.value)
        await save_bot_config(self.pool, "ticket_btn_label", self.btn_label_input.value)

        await interaction.followup.send("✅ Тексты и параметры тикет-панели успешно сохранены в базе!", ephemeral=True)


class TicketCloseView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="🔒 Закрыть тикет", style=discord.ButtonStyle.red, custom_id="ticket_close_btn")
    async def close_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_message("🔒 Тикет закрывается через 5 секунд...", ephemeral=False)
        await discord.utils.sleep_until(discord.utils.utcnow() + discord.utils.timedelta(seconds=5))
        try:
            await interaction.channel.delete(reason=f"Тикет закрыт администратором/пользователем {interaction.user}")
        except Exception as e:
            print("Error deleting channel:", e)


class CreateTicketModal(discord.ui.Modal, title="📩 Создание обращения"):
    subject = discord.ui.TextInput(
        label="Тема обращения",
        placeholder="Например: Проблема с ваучером / Вопрос по игре",
        required=True
    )
    message = discord.ui.TextInput(
        label="Подробное описание",
        style=discord.TextStyle.paragraph,
        placeholder="Опишите вашу проблему максимально подробно...",
        required=True
    )

    def __init__(self, bot, pool):
        super().__init__()
        self.bot = bot
        self.pool = pool

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        guild = interaction.guild
        category_id_str = await get_bot_config(self.pool, "ticket_category_id", "")
        support_role_id_str = await get_bot_config(self.pool, "ticket_role_id", "")

        category = None
        if category_id_str.isdigit():
            category = guild.get_channel(int(category_id_str))

        # Permissions: User + Bot + Support Role
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            interaction.user: discord.PermissionOverwrite(read_messages=True, send_messages=True, attach_files=True),
            guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True, manage_channels=True)
        }

        if support_role_id_str.isdigit():
            role = guild.get_role(int(support_role_id_str))
            if role:
                overwrites[role] = discord.PermissionOverwrite(read_messages=True, send_messages=True)

        channel_name = f"ticket-{interaction.user.name.lower()}"
        ticket_channel = await guild.create_text_channel(
            name=channel_name,
            category=category,
            overwrites=overwrites,
            reason=f"Тикет создан {interaction.user}"
        )

        embed = discord.Embed(
            title=f"📩 Обращение: {self.subject.value}",
            description=self.message.value,
            color=0x7c3aed
        )
        embed.set_author(name=interaction.user.display_name, icon_url=interaction.user.display_avatar.url)
        embed.set_footer(text=f"User ID: {interaction.user.id} | Ожидайте ответа поддержки")

        await ticket_channel.send(
            content=f"{interaction.user.mention} Добро пожаловать! Поддержка скоро ответит.",
            embed=embed,
            view=TicketCloseView()
        )

        await interaction.followup.send(f"✅ Ваш тикет создан: {ticket_channel.mention}", ephemeral=True)


class TicketPanelView(discord.ui.View):
    def __init__(self, bot, pool, btn_label: str = "📩 Создать тикет"):
        super().__init__(timeout=None)
        self.bot = bot
        self.pool = pool
        
        # Dynamic button
        button = discord.ui.Button(
            label=btn_label,
            style=discord.ButtonStyle.blurple,
            custom_id="create_ticket_panel_btn",
            emoji="🎫"
        )
        button.callback = self.create_ticket_click
        self.add_item(button)

    async def create_ticket_click(self, interaction: discord.Interaction):
        modal = CreateTicketModal(self.bot, self.pool)
        await interaction.response.send_modal(modal)


class TicketsCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="setup", description="[Админ] Интерактивная настройка всех каналов, ролей и текстов бота")
    @app_commands.checks.has_permissions(administrator=True)
    async def setup_cmd(
        self,
        interaction: discord.Interaction,
        category: discord.CategoryChannel = None,
        support_role: discord.Role = None,
        orders_channel: discord.TextChannel = None
    ):
        pool = getattr(self.bot, 'pool', None)
        if not pool:
            await interaction.response.send_message("❌ База данных не подключена", ephemeral=True)
            return

        if category:
            await save_bot_config(pool, "ticket_category_id", str(category.id))
        if support_role:
            await save_bot_config(pool, "ticket_role_id", str(support_role.id))
        if orders_channel:
            await save_bot_config(pool, "orders_channel_id", str(orders_channel.id))

        modal = SetupModal(self.bot, pool)
        await interaction.response.send_modal(modal)

    @app_commands.command(name="send_ticket_panel", description="[Админ] Отправить панель создания тикетов в текущий канал")
    @app_commands.checks.has_permissions(administrator=True)
    async def send_ticket_panel(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        pool = getattr(self.bot, 'pool', None)

        title = await get_bot_config(pool, "ticket_title", "🎫 Служба поддержки RUH PROJECT")
        desc = await get_bot_config(pool, "ticket_desc", "Нужна помощь администратора или возник вопрос по ваучерам? Нажмите кнопку ниже для создания тикета.")
        btn_label = await get_bot_config(pool, "ticket_btn_label", "📩 Создать тикет")

        embed = discord.Embed(
            title=title,
            description=desc,
            color=0x7c3aed
        )
        embed.set_footer(text="RUH PROJECT • Поддержка 24/7")

        view = TicketPanelView(self.bot, pool, btn_label)
        await interaction.channel.send(embed=embed, view=view)
        await interaction.followup.send("✅ Панель тикетов успешно отправлена!", ephemeral=True)


async def setup(bot):
    await bot.add_cog(TicketsCog(bot))
