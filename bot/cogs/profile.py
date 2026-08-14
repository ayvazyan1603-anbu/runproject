import discord
from discord.ext import commands
from discord import app_commands
import config
from database import get_verification, get_player

class ProfileView(discord.ui.View):
    def __init__(self, bot, pool, steamid: str):
        super().__init__(timeout=120)
        self.bot = bot
        self.pool = pool
        self.steamid = steamid

        # Site Profile Link Button
        self.add_item(discord.ui.Button(
            label="🌐 Мой профиль на сайте",
            style=discord.ButtonStyle.link,
            url=f"{config.SITE_URL}/profile"
        ))

    @discord.ui.button(label="🔄 Обновить", style=discord.ButtonStyle.grey, custom_id="profile_refresh")
    async def refresh(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        player = await get_player(self.pool, self.steamid)
        
        embed = discord.Embed(
            title=f"👤 Профиль RUH PROJECT — {interaction.user.display_name}",
            color=0x7c3aed
        )
        embed.set_thumbnail(url=interaction.user.display_avatar.url)
        embed.add_field(name="SteamID", value=f"`{self.steamid}`", inline=False)

        if player:
            vip_text = player['vip_group'] if player.get('vip_group') else "Нет активного ваучера"
            expires = str(player['expires_at'])[:10] if player.get('expires_at') else "—"
            kills = player.get('kills') or 0
            deaths = player.get('deaths') or 0
            headshots = player.get('headshots') or 0
            playtime = round((player.get('playtime') or 0) / 60, 1)
            rank = player.get('rank') or "—"
            kd = round(kills / max(deaths, 1), 2)

            embed.add_field(name="Ваучер", value=f"**{vip_text}**", inline=True)
            embed.add_field(name="Истекает", value=expires, inline=True)
            embed.add_field(name="Ранг", value=f"#{rank}", inline=True)
            embed.add_field(name="Убийства / Смерти", value=f"{kills} / {deaths}", inline=True)
            embed.add_field(name="K/D", value=str(kd), inline=True)
            embed.add_field(name="Хедшоты", value=str(headshots), inline=True)
            embed.add_field(name="Наиграно", value=f"{playtime} ч", inline=True)
        else:
            embed.add_field(name="Ваучер", value="Нет активного ваучера", inline=False)
            embed.add_field(name="Статистика", value="Играйте на серверах RUH PROJECT для подсчёта статистики!", inline=False)

        await interaction.edit_original_response(embed=embed, view=self)


class ProfileCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="profile", description="Просмотр моего профиля и статистики RUH PROJECT")
    async def profile(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        pool = getattr(self.bot, 'pool', None)
        if not pool:
            await interaction.followup.send("❌ База данных не подключена", ephemeral=True)
            return

        verification = await get_verification(pool, interaction.user.id)

        if not verification:
            embed = discord.Embed(
                title="❌ Аккаунт не верифицирован",
                description="Вы ещё не привязали свой Steam аккаунт. Используйте команду `/verify` чтобы привязать Steam.",
                color=0xef4444
            )
            await interaction.followup.send(embed=embed, ephemeral=True)
            return

        steamid = verification['steamid']
        player = await get_player(pool, steamid)

        embed = discord.Embed(
            title=f"👤 Профиль RUH PROJECT — {interaction.user.display_name}",
            color=0x7c3aed
        )
        embed.set_thumbnail(url=interaction.user.display_avatar.url)
        embed.add_field(name="SteamID", value=f"`{steamid}`", inline=False)

        if player:
            vip_text = player['vip_group'] if player.get('vip_group') else "Нет активного ваучера"
            expires = str(player['expires_at'])[:10] if player.get('expires_at') else "—"
            kills = player.get('kills') or 0
            deaths = player.get('deaths') or 0
            headshots = player.get('headshots') or 0
            playtime = round((player.get('playtime') or 0) / 60, 1)
            rank = player.get('rank') or "—"
            kd = round(kills / max(deaths, 1), 2)

            embed.add_field(name="Ваучер", value=f"**{vip_text}**", inline=True)
            embed.add_field(name="Истекает", value=expires, inline=True)
            embed.add_field(name="Ранг", value=f"#{rank}", inline=True)
            embed.add_field(name="Убийства / Смерти", value=f"{kills} / {deaths}", inline=True)
            embed.add_field(name="K/D", value=str(kd), inline=True)
            embed.add_field(name="Хедшоты", value=str(headshots), inline=True)
            embed.add_field(name="Наиграно", value=f"{playtime} ч", inline=True)
        else:
            embed.add_field(name="Ваучер", value="Нет активного ваучера", inline=False)
            embed.add_field(name="Статистика", value="Статистика появится после первой игры на сервере!", inline=False)

        view = ProfileView(self.bot, pool, steamid)
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)


async def setup(bot):
    await bot.add_cog(ProfileCog(bot))
