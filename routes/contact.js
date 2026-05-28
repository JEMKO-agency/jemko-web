const express = require('express');
const router  = express.Router();
const { stmts } = require('../db/database');
const { appendContact } = require('../services/sheets');

// ─── POST /api/contact ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { nombre, empresa, email, whatsapp, intereses, mensaje } = req.body;

  // Validación mínima
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    return res.status(400).json({ ok: false, error: 'El nombre es requerido.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Email inválido.' });
  }

  try {
    const info = stmts.insertContact.run({
      nombre:     nombre.trim().substring(0, 100),
      empresa:    (empresa    || '').trim().substring(0, 100),
      email:      email.trim().toLowerCase().substring(0, 150),
      whatsapp:   (whatsapp   || '').trim().substring(0, 30),
      intereses:  Array.isArray(intereses)
                    ? intereses.join(', ').substring(0, 300)
                    : (intereses || '').substring(0, 300),
      mensaje:    (mensaje    || '').trim().substring(0, 2000),
      ip:         req.ip,
      user_agent: (req.headers['user-agent'] || '').substring(0, 200),
    });

    // Intentar sync con Sheets (no bloqueante)
    const newRow = { id: info.lastInsertRowid, ...req.body, created_at: new Date().toISOString() };
    appendContact(newRow).then(ok => {
      if (ok) stmts.markContactSynced.run(info.lastInsertRowid);
    });

    return res.json({
      ok: true,
      message: '¡Recibido! Te respondemos en menos de 24 hs.',
    });
  } catch (err) {
    console.error('[Contact] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'Error interno. Intentá de nuevo.' });
  }
});

module.exports = router;
