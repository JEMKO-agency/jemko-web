const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Asegura que el directorio db existe
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'jemko.db'));

// Configuración de rendimiento
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Tabla de leads (formulario de contacto) ────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT NOT NULL,
    empresa     TEXT,
    email       TEXT NOT NULL,
    whatsapp    TEXT,
    intereses   TEXT,
    mensaje     TEXT,
    ip          TEXT,
    user_agent  TEXT,
    synced_sheets INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// ─── Tabla de suscriptores al newsletter ────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE,
    ip          TEXT,
    synced_sheets INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// ─── Prepared statements ────────────────────────────────────────────────────
const stmts = {
  insertContact: db.prepare(`
    INSERT INTO contacts (nombre, empresa, email, whatsapp, intereses, mensaje, ip, user_agent)
    VALUES (@nombre, @empresa, @email, @whatsapp, @intereses, @mensaje, @ip, @user_agent)
  `),

  insertSubscriber: db.prepare(`
    INSERT OR IGNORE INTO newsletter_subscribers (email, ip)
    VALUES (@email, @ip)
  `),

  allContacts: db.prepare(`
    SELECT id, nombre, empresa, email, whatsapp, intereses, mensaje, created_at
    FROM contacts
    ORDER BY created_at DESC
  `),

  allSubscribers: db.prepare(`
    SELECT id, email, created_at
    FROM newsletter_subscribers
    ORDER BY created_at DESC
  `),

  pendingSheetsContacts: db.prepare(`
    SELECT * FROM contacts WHERE synced_sheets = 0
  `),

  pendingSheetsSubscribers: db.prepare(`
    SELECT * FROM newsletter_subscribers WHERE synced_sheets = 0
  `),

  markContactSynced: db.prepare(`
    UPDATE contacts SET synced_sheets = 1 WHERE id = ?
  `),

  markSubscriberSynced: db.prepare(`
    UPDATE newsletter_subscribers SET synced_sheets = 1 WHERE id = ?
  `),
};

module.exports = { db, stmts };
