import time
import aiomysql
import config

async def get_pool():
    return await aiomysql.create_pool(
        host=config.DB_HOST,
        port=config.DB_PORT,
        db=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        autocommit=True
    )

def steamid_to_account_id(steamid: str) -> int:
    try:
        sid = int(str(steamid).strip())
        if sid > 76561197960265728:
            return sid - 76561197960265728
        return sid
    except Exception:
        return 0

async def grant_vip(pool, steamid: str, group: str, days: int = 30):
    account_id = steamid_to_account_id(steamid)
    now_ts = int(time.time())
    expires_ts = now_ts + (int(days) * 86400)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT account_id FROM vip_users WHERE account_id = %s OR steamid = %s", (account_id, steamid))
            row = await cur.fetchone()
            if row:
                await cur.execute("""
                    UPDATE vip_users
                    SET `group` = %s, vip_group = %s, expires = %s, expires_at = DATE_ADD(NOW(), INTERVAL %s DAY), lastvisit = %s
                    WHERE account_id = %s OR steamid = %s
                """, (group, group, expires_ts, days, now_ts, account_id, steamid))
            else:
                await cur.execute("""
                    INSERT INTO vip_users (account_id, name, lastvisit, sid, `group`, expires, vip_group, expires_at, steamid)
                    VALUES (%s, %s, %s, 0, %s, %s, %s, DATE_ADD(NOW(), INTERVAL %s DAY), %s)
                """, (account_id, "Player", now_ts, group, expires_ts, group, days, steamid))

async def get_player(pool, steamid: str):
    account_id = steamid_to_account_id(steamid)
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT v.`group` as vip_group, v.expires_at, v.expires,
                       r.kills, r.deaths, r.headshots, r.playtime, r.rank
                FROM vip_users v
                LEFT JOIN ranks_statistics r ON (r.steam = v.steamid OR r.steam = %s)
                WHERE (v.steamid = %s OR v.account_id = %s) AND (v.expires > UNIX_TIMESTAMP() OR v.expires = 0 OR v.expires_at > NOW())
            """, (steamid, steamid, account_id))
            res = await cur.fetchone()
            if res:
                return res
            # Fallback if no active VIP but has ranks_statistics
            await cur.execute("""
                SELECT NULL as vip_group, NULL as expires_at,
                       r.kills, r.deaths, r.headshots, r.playtime, r.rank
                FROM ranks_statistics r
                WHERE r.steam = %s
            """, (steamid,))
            return await cur.fetchone()

async def save_verification(pool, discord_id: int, steamid: str):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO ruh_discord_verification (discord_id, steamid)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE steamid = VALUES(steamid)
            """, (discord_id, steamid))

async def get_verification(pool, discord_id: int):
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT steamid FROM ruh_discord_verification WHERE discord_id = %s",
                (discord_id,)
            )
            return await cur.fetchone()

async def create_order(pool, steamid: str, discord_id: int, player_name: str, voucher: str, price: int, screenshot_url: str):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO ruh_orders (steamid, discord_id, player_name, voucher, price, screenshot_url, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'pending')
            """, (steamid, discord_id, player_name, voucher, price, screenshot_url))
            return cur.lastrowid

async def update_order_status(pool, order_id: int, status: str):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE ruh_orders SET status = %s WHERE id = %s",
                (status, order_id)
            )

async def get_bot_config(pool, key: str, default: str = "") -> str:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT `value` FROM ruh_bot_config WHERE `key` = %s", (key,))
            res = await cur.fetchone()
            return res['value'] if res else default

async def save_bot_config(pool, key: str, value: str):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                INSERT INTO ruh_bot_config (`key`, `value`)
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)
            """, (key, value))
