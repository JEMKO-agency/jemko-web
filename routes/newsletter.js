const express = require('express');
const router  = express.Router();
const { stmts } = require('../db/database');
const { appendSubscriber } = require('../services/sheets');

// ─── POST /api/newsletter ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Email inválido.' });
  }

  try {
    const info = stmts.insertSubscriber.run({
      email: email.trim().toLowerCase().substring(0, 150),
      ip:    req.ip,
    });

    if (info.changes === 0) {
      // Ya estaba suscripto (INSERT OR IGNORE)
      return res.json({ ok: true, message: 'Ya estás suscripto. ¡Gracias!' });
    }

    // Intentar sync con Sheets (no bloqueante)
    const newRow = { id: info.lastInsertRowid, email, created_at: new Date().toISOString() };
    appendSubscriber(newRow).then(ok => {
      if (ok) stmts.markSubscriberSynced.run(info.lastInsertRowid);
    });

    return res.json({ ok: true, message: '¡Suscripto! Bienvenido a la comunidad JEMKO.' });
  } catch (err) {
    console.error('[Newsletter] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'Error interno. Intentá de nuevo.' });
  }
});

module.exports = router;
