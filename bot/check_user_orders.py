import asyncio
import aiomysql

async def check():
    try:
        conn = await aiomysql.connect(
            host="u13.joingame.kz",
            port=3306,
            db="sql_9326_free",
            user="sql_9326_free",
            password="KkrmQZqkfL"
        )
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM ruh_orders")
            orders = await cur.fetchall()
            print("=== RUH ORDERS ===")
            for o in orders:
                print(o)

            await cur.execute("SELECT * FROM vip_users")
            vips = await cur.fetchall()
            print("\n=== VIP USERS ===")
            for v in vips:
                print(v)

        conn.close()
    except Exception as e:
        print("Error:", e)

asyncio.run(check())
