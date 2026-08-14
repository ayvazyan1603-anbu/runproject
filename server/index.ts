import express, { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dgram from 'dgram';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

function getParamString(param: unknown): string {
  if (Array.isArray(param)) return String(param[0] || '');
  return String(param || '');
}

// Ensure uploads folder exists and serve statically
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `kaspi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});
const upload = multer({ storage });

const db = mysql.createPool({
  host: process.env['DB_HOST'] || 'u13.joingame.kz',
  port: Number(process.env['DB_PORT'] || 3306),
  database: process.env['DB_NAME'] || 'sql_9326_free',
  user: process.env['DB_USER'] || 'sql_9326_free',
  password: process.env['DB_PASSWORD'] || 'KkrmQZqkfL',
});

/**
 * Query live CS2 / Source Engine server info via A2S_INFO UDP protocol
 */
interface ServerInfo {
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  bots: number;
  status: "online" | "offline";
  ip: string;
  port: number;
}

function querySourceServer(ip: string, port: number, timeoutMs = 2500): Promise<ServerInfo> {
  return new Promise((resolve) => {
    const client = dgram.createSocket("udp4");
    let isClosed = false;

    const safeClose = () => {
      if (!isClosed) {
        isClosed = true;
        try { client.close(); } catch {}
      }
    };

    const A2S_INFO = Buffer.from([
      0xFF, 0xFF, 0xFF, 0xFF, 0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69,
      0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00
    ]);

    const sendQuery = () => {
      try {
        client.send(A2S_INFO, 0, A2S_INFO.length, port, ip);
      } catch {
        safeClose();
        resolve({
          name: "RUH | CS2 Server",
          map: "de_dust2",
          players: 0,
          maxPlayers: 30,
          bots: 0,
          status: "online",
          ip,
          port,
        });
      }
    };

    client.on("message", (msg) => {
      try {
        if (msg.length < 6) return;

        let offset = 4;
        const header = msg[offset++];
        if (header !== 0x49) return;

        const readString = (): string => {
          const end = msg.indexOf(0x00, offset);
          if (end === -1) return "";
          const str = msg.toString("utf8", offset, end);
          offset = end + 1;
          return str;
        };

        const protocol = msg[offset++];
        const name = readString();
        const map = readString();
        const folder = readString();
        const game = readString();
        const steamAppId = msg.readUInt16LE(offset); offset += 2;
        const players = msg[offset++] ?? 0;
        const maxPlayers = msg[offset++] ?? 30;
        const bots = msg[offset++] ?? 0;

        safeClose();
        resolve({
          name,
          map,
          players,
          maxPlayers,
          bots,
          status: "online",
          ip,
          port,
        });
      } catch {
        safeClose();
        resolve({
          name: "RUH | CS2 Server",
          map: "de_dust2",
          players: 0,
          maxPlayers: 30,
          bots: 0,
          status: "online",
          ip,
          port,
        });
      }
    });

    client.on("error", () => {
      safeClose();
      resolve({
        name: "RUH | CS2 Server",
        map: "de_dust2",
        players: 0,
        maxPlayers: 30,
        bots: 0,
        status: "offline",
        ip,
        port,
      });
    });

    sendQuery();
    setTimeout(() => {
      safeClose();
      resolve({
        name: "RUH | CS2 Server",
        map: "de_dust2",
        players: 0,
        maxPlayers: 30,
        bots: 0,
        status: "online",
        ip,
        port,
      });
    }, timeoutMs);
  });
}

async function initDb() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init-tables.sql'), 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await db.query(stmt).catch(() => {});
    }

    // Auto-migrate vip_users columns if table already existed without them
    await db.query(`ALTER TABLE vip_users ADD COLUMN vip_group VARCHAR(32) NOT NULL DEFAULT 'VIP'`).catch(() => {});
    await db.query(`ALTER TABLE vip_users ADD COLUMN expires_at DATETIME NOT NULL DEFAULT NOW()`).catch(() => {});
    await db.query(`ALTER TABLE vip_users ADD COLUMN steamid VARCHAR(32)`).catch(() => {});
    await db.query(`ALTER TABLE vip_users ADD COLUMN account_id INT DEFAULT 0`).catch(() => {});
    await db.query(`ALTER TABLE vip_users MODIFY COLUMN account_id INT DEFAULT 0`).catch(() => {});

    console.log('Tables and migrations initialized');
  } catch (err) {
    console.error('Failed to init tables:', err);
  }
}

initDb();

app.get('/api/server-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const info = await querySourceServer("79.143.20.204", 27024);
    res.json(info);
  } catch (err) {
    console.error(err);
    res.json({
      ip: "79.143.20.204",
      port: 27024,
      players: 0,
      maxPlayers: 30,
      map: "de_dust2",
      status: "online",
      name: "RUH | Public CS2"
    });
  }
});

app.get('/api/servers', async (req: Request, res: Response): Promise<void> => {
  try {
    const liveInfo = await querySourceServer("79.143.20.204", 27024);
    const serversList = [
      {
        id: "s1",
        name: liveInfo.name && liveInfo.name !== "Counter-Strike 2" ? liveInfo.name : "RUH PROJECT | PUBLIC CS2",
        map: liveInfo.map || "de_dust2",
        players: liveInfo.players || 0,
        maxPlayers: liveInfo.maxPlayers || 30,
        status: liveInfo.status || "online",
        ip: "79.143.20.204:27024",
      },
    ];
    res.json(serversList);
  } catch (err) {
    console.error(err);
    res.json([
      {
        id: "s1",
        name: "RUH PROJECT | PUBLIC CS2",
        map: "de_dust2",
        players: 0,
        maxPlayers: 30,
        status: "online",
        ip: "79.143.20.204:27024",
      },
    ]);
  }
});

app.get('/api/ranks', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<any[]>(
      'SELECT steam as steamid, name as nickname, `rank` as points, kills, deaths, playtime as hours FROM ranks_statistics ORDER BY `rank` DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/punishments', async (req: Request, res: Response): Promise<void> => {
  try {
    const [bans] = await db.query<any[]>(
      'SELECT id, player_name as nickname, type, reason, admin_name as admin, DATE_FORMAT(created, "%d.%m.%Y") as date, "Навсегда" as duration FROM sa_bans ORDER BY created DESC LIMIT 50'
    );
    const [mutes] = await db.query<any[]>(
      'SELECT id, player_name as nickname, type, reason, admin_name as admin, DATE_FORMAT(created, "%d.%m.%Y") as date, "Навсегда" as duration FROM sa_mutes ORDER BY created DESC LIMIT 50'
    );
    res.json([...bans, ...mutes]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/player/:steamid', async (req: Request, res: Response): Promise<void> => {
  try {
    const steamid = getParamString(req.params['steamid']);
    let accountId = 0;
    try {
      const sid = BigInt(steamid);
      if (sid > 76561197960265728n) {
        accountId = Number(sid - 76561197960265728n);
      } else {
        accountId = Number(sid);
      }
    } catch {}

    const [vips] = await db.query<any[]>(
      `SELECT COALESCE(NULLIF(vip_group, ''), \`group\`, 'VIP') as vip_group, expires_at, expires
       FROM vip_users
       WHERE steamid = ? OR account_id = ?
       ORDER BY expires_at DESC`,
      [steamid, accountId]
    );

    const [orders] = await db.query<any[]>(
      `SELECT id, voucher, price, status, created_at
       FROM ruh_orders
       WHERE steamid = ? OR steamid = ?
       ORDER BY created_at DESC`,
      [steamid, String(accountId)]
    );

    const [stats] = await db.query<any[]>(
      'SELECT * FROM ranks_statistics WHERE steam = ? OR steam = ?',
      [steamid, String(accountId)]
    );

    const activeVip = vips.find(v => {
      if (v.expires_at) return new Date(v.expires_at).getTime() > Date.now();
      if (v.expires) return v.expires * 1000 > Date.now() || v.expires === 0;
      return false;
    }) || null;

    res.json({
      vip: activeVip,
      vips,
      orders,
      stats: stats[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/vip/:steamid', async (req: Request, res: Response): Promise<void> => {
  try {
    const steamid = getParamString(req.params['steamid']);
    let accountId = 0;
    try {
      const sid = BigInt(steamid);
      if (sid > 76561197960265728n) {
        accountId = Number(sid - 76561197960265728n);
      } else {
        accountId = Number(sid);
      }
    } catch {}

    const [rows] = await db.query<any[]>(
      `SELECT \`group\` as vip_group, expires_at, expires FROM vip_users 
       WHERE (steamid = ? OR account_id = ?) AND (expires > UNIX_TIMESTAMP() OR expires = 0 OR expires_at > NOW())`,
      [steamid, accountId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/vip/grant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { steamid, group, days } = req.body;
    if (!steamid || !group || !days) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }
    let accountId = 0;
    try {
      const sid = BigInt(steamid);
      if (sid > 76561197960265728n) {
        accountId = Number(sid - 76561197960265728n);
      } else {
        accountId = Number(sid);
      }
    } catch {}

    const nowTs = Math.floor(Date.now() / 1000);
    const expiresTs = nowTs + (Number(days) * 86400);

    const [rows] = await db.query<any[]>(
      'SELECT account_id FROM vip_users WHERE account_id = ? OR steamid = ?',
      [accountId, steamid]
    );

    if (rows.length > 0) {
      await db.query(
        `UPDATE vip_users 
         SET \`group\` = ?, vip_group = ?, expires = ?, expires_at = DATE_ADD(NOW(), INTERVAL ? DAY), lastvisit = ?
         WHERE account_id = ? OR steamid = ?`,
        [group, group, expiresTs, days, nowTs, accountId, steamid]
      );
    } else {
      await db.query(
        `INSERT INTO vip_users (account_id, name, lastvisit, sid, \`group\`, expires, vip_group, expires_at, steamid)
         VALUES (?, ?, ?, 0, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?)`,
        [accountId, 'Player', nowTs, group, expiresTs, group, days, steamid]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/models/:steamid', async (req: Request, res: Response): Promise<void> => {
  try {
    const steamid = getParamString(req.params['steamid']);
    const [rows] = await db.query<any[]>(
      'SELECT ct_model, t_model FROM ruh_player_models WHERE steamid = ?',
      [steamid]
    );
    res.json(rows[0] || { ct_model: null, t_model: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/models', async (req: Request, res: Response): Promise<void> => {
  try {
    const { steamid, ct_model, t_model } = req.body;
    if (!steamid) {
      res.status(400).json({ error: 'Missing steamid' });
      return;
    }

    await db.query(
      `INSERT INTO ruh_player_models (steamid, ct_model, t_model) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE ct_model = VALUES(ct_model), t_model = VALUES(t_model)`,
      [steamid, ct_model || null, t_model || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/skins/:steamid', async (req: Request, res: Response): Promise<void> => {
  try {
    const steamid = getParamString(req.params['steamid']);
    const [rows] = await db.query<any[]>(
      'SELECT knife, gloves, ct_model, t_model, skins_json FROM ruh_player_skins WHERE steamid = ?',
      [steamid]
    );
    if (!rows[0]) {
      res.json({ knife: null, gloves: null, ct_model: null, t_model: null, skins: {} });
      return;
    }
    const skins = rows[0].skins_json ? JSON.parse(rows[0].skins_json) : {};
    res.json({
      knife: rows[0].knife,
      gloves: rows[0].gloves,
      ct_model: rows[0].ct_model,
      t_model: rows[0].t_model,
      skins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/skins', async (req: Request, res: Response): Promise<void> => {
  try {
    const { steamid, knife, gloves, ct_model, t_model, skins } = req.body;
    if (!steamid) {
      res.status(400).json({ error: 'Missing steamid' });
      return;
    }

    const skinsJson = skins ? JSON.stringify(skins) : '{}';

    await db.query(
      `INSERT INTO ruh_player_skins (steamid, knife, gloves, ct_model, t_model, skins_json)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         knife = VALUES(knife),
         gloves = VALUES(gloves),
         ct_model = VALUES(ct_model),
         t_model = VALUES(t_model),
         skins_json = VALUES(skins_json)`,
      [steamid, knife || null, gloves || null, ct_model || null, t_model || null, skinsJson]
    );

    // Also update ruh_player_models for backwards compatibility with CS2 plugins
    if (ct_model || t_model) {
      await db.query(
        `INSERT INTO ruh_player_models (steamid, ct_model, t_model) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE ct_model = VALUES(ct_model), t_model = VALUES(t_model)`,
        [steamid, ct_model || null, t_model || null]
      );
    }

    res.json({ success: true, message: 'Скины успешно применены на сервере!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/tickets', async (req: Request, res: Response): Promise<void> => {
  try {
    const { steamid, player_name, subject, category, message } = req.body;
    if (!steamid || !subject || !category || !message) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }
    
    await db.query(
      'INSERT INTO ruh_tickets (steamid, player_name, subject, category, message) VALUES (?, ?, ?, ?, ?)',
      [steamid, player_name, subject, category, message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/tickets/:steamid', async (req: Request, res: Response): Promise<void> => {
  try {
    const steamid = getParamString(req.params['steamid']);
    const [rows] = await db.query(
      'SELECT * FROM ruh_tickets WHERE steamid = ? ORDER BY created_at DESC',
      [steamid]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const VOUCHER_PRICES: Record<string, number> = {
  "VIP": 1499,
  "BATYR": 2999,
  "KHAN": 4399,
  "SULTAN": 7999,
  "RUH": 10999
};

app.post('/api/orders', upload.single('screenshot'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { steamid, voucher, discord_id, player_name } = req.body;
    if (!steamid || !voucher) {
      res.status(400).json({ error: 'Missing required parameters (steamid, voucher)' });
      return;
    }

    const price = VOUCHER_PRICES[voucher] || 1499;
    const filename = req.file ? req.file.filename : null;
    const baseUrl = process.env['VITE_SITE_URL'] || 'http://localhost:3001';
    const screenshot_url = filename ? `${baseUrl}/uploads/${filename}` : null;

    const [result] = await db.query<any>(
      `INSERT INTO ruh_orders (steamid, discord_id, player_name, voucher, price, screenshot_url, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [steamid, discord_id ? Number(discord_id) : null, player_name || 'Игрок', voucher, price, screenshot_url]
    );

    const orderId = result.insertId;

    // Send order webhook to Discord Bot
    try {
      await fetch('http://localhost:5000/webhook/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          steamid,
          voucher,
          price,
          discord_id: discord_id || null,
          player_name: player_name || 'Игрок',
          screenshot_url,
          screenshot_path: req.file ? req.file.path : null,
        }),
      });
    } catch (botErr) {
      console.warn('Failed to forward order to Discord Bot:', botErr);
    }

    res.json({ success: true, message: 'Заявка отправлена! Ожидайте подтверждения администратора.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { discord_id, steamid, player_name } = req.body;
    if (!discord_id || !steamid) {
      res.status(400).json({ error: 'discord_id and steamid required' });
      return;
    }

    await db.query(
      `INSERT INTO ruh_discord_verification (discord_id, steamid)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE steamid = VALUES(steamid)`,
      [discord_id, steamid]
    );

    // Forward verification webhook to Discord Bot
    try {
      await fetch('http://localhost:5000/webhook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_id,
          steamid,
          player_name: player_name || 'Игрок',
        }),
      });
    } catch (botErr) {
      console.warn('Failed to forward verify to Discord Bot:', botErr);
    }

    res.json({ success: true, message: 'Steam аккаунт успешно привязан к Discord!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default app;

if (!process.env['VERCEL']) {
  const PORT = process.env['PORT'] || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
