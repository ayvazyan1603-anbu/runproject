import asyncio
import aiomysql

async def inspect():
    try:
        conn = await aiomysql.connect(
            host="u13.joingame.kz",
            port=3306,
            db="sql_9326_free",
            user="sql_9326_free",
            password="KkrmQZqkfL"
        )
        async with conn.cursor() as cur:
            await cur.execute("DESCRIBE vip_users")
            cols = await cur.fetchall()
            print("COLUMNS IN vip_users:")
            for col in cols:
                print(col)
        conn.close()
    except Exception as e:
        print("Error inspecting DB:", e)

asyncio.run(inspect())
