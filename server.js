require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const contactRouter    = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL === '*'
  ? true
  : [process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiadas solicitudes. Intentá en unos minutos.' },
});
app.use('/api/', apiLimiter);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/contact',    contactRouter);
app.use('/api/newsletter', newsletterRouter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'JEMKO Backend', ts: new Date().toISOString() });
});

// ─── Admin panel ─────────────────────────────────────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'jemko2026';

// Middleware de autenticación básica para /admin
function basicAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="JEMKO Admin"');
    return res.status(401).send('Autenticación requerida.');
  }
  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  res.set('WWW-Authenticate', 'Basic realm="JEMKO Admin"');
  return res.status(401).send('Credenciales incorrectas.');
}

app.use('/admin', basicAuth, express.static(path.join(__dirname, 'admin')));

// API para el admin (devuelve datos en JSON)
const { stmts } = require('./db/database');

app.get('/api/admin/contacts', basicAuth, (req, res) => {
  res.json(stmts.allContacts.all());
});

app.get('/api/admin/subscribers', basicAuth, (req, res) => {
  res.json(stmts.allSubscribers.all());
});

// ─── Servir frontend estático ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
// Fallback: cualquier ruta no reconocida sirve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 JEMKO Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Panel admin: http://localhost:${PORT}/admin`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);
});
