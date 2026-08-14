CREATE TABLE IF NOT EXISTS vip_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL UNIQUE,
  vip_group VARCHAR(32) NOT NULL DEFAULT 'VIP',
  expires_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS ranks_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steam VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL DEFAULT '',
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  shoots INT DEFAULT 0,
  hits INT DEFAULT 0,
  headshots INT DEFAULT 0,
  assists INT DEFAULT 0,
  round_win INT DEFAULT 0,
  round_lose INT DEFAULT 0,
  playtime INT DEFAULT 0,
  lastconnect INT DEFAULT 0,
  `rank` INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sa_bans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(64),
  player_steamid VARCHAR(32),
  reason VARCHAR(255),
  type VARCHAR(32) DEFAULT 'ban',
  admin_name VARCHAR(64) DEFAULT 'Console',
  created DATETIME DEFAULT NOW(),
  end DATETIME,
  status VARCHAR(32) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS sa_mutes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(64),
  player_steamid VARCHAR(32),
  reason VARCHAR(255),
  type VARCHAR(32) DEFAULT 'mute',
  admin_name VARCHAR(64) DEFAULT 'Console',
  created DATETIME DEFAULT NOW(),
  end DATETIME,
  status VARCHAR(32) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS ruh_player_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL UNIQUE,
  ct_model VARCHAR(128),
  t_model VARCHAR(128),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE IF NOT EXISTS ruh_player_skins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL UNIQUE,
  knife VARCHAR(64) DEFAULT NULL,
  gloves VARCHAR(64) DEFAULT NULL,
  ct_model VARCHAR(64) DEFAULT NULL,
  t_model VARCHAR(64) DEFAULT NULL,
  skins_json TEXT DEFAULT NULL,
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE IF NOT EXISTS ruh_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL,
  player_name VARCHAR(64),
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'processing', 'closed') DEFAULT 'open',
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ruh_discord_verification (
  discord_id BIGINT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ruh_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  steamid VARCHAR(32) NOT NULL,
  discord_id BIGINT,
  player_name VARCHAR(64),
  voucher VARCHAR(20) NOT NULL,
  price INT NOT NULL,
  screenshot_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ruh_bot_config (
  `key` VARCHAR(64) PRIMARY KEY,
  `value` TEXT NOT NULL
);
