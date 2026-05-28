# JEMKO Backend — Guía de instalación

## Requisitos
- Node.js v18 o superior → https://nodejs.org
- npm (viene con Node)

---

## 1. Instalación

Abrí una terminal en la carpeta `backend/` y ejecutá:

```bash
npm install
```

---

## 2. Configuración

Copiá el archivo de ejemplo y completalo con tus datos:

```bash
cp .env.example .env
```

Editá `.env`:

```env
PORT=3000
ADMIN_USER=admin
ADMIN_PASSWORD=tu_password_seguro

# Google Sheets (opcional — dejá GOOGLE_SHEETS_ENABLED=false para empezar sin esto)
GOOGLE_SHEETS_ENABLED=false
```

---

## 3. Correr el servidor

**Desarrollo** (se reinicia automáticamente al guardar cambios):
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

El servidor queda corriendo en: **http://localhost:3000**

---

## 4. Panel de administración

Accedé a: **http://localhost:3000/admin**

Credenciales por defecto:
- Usuario: `admin`
- Password: `jemko2026` (cambialo en `.env`)

Desde el panel podés:
- Ver todos los leads del formulario de contacto
- Ver todos los suscriptores del newsletter
- Exportar en CSV

---

## 5. Conectar el frontend

En `index.html` y `contacto.html`, el API URL por defecto es `http://localhost:3000`.

Cuando tengas el dominio real, cambiá la variable en el HTML:

```html
<script>window.JEMKO_API_URL = 'https://tu-backend.railway.app';</script>
```

Ponela antes de los demás scripts.

---

## 6. Google Sheets (opcional)

Para sincronizar leads y suscriptores automáticamente a una planilla:

1. Creá un proyecto en https://console.cloud.google.com
2. Habilitá la API de Google Sheets
3. Creá una cuenta de servicio y descargá el JSON de credenciales
4. Compartí la hoja de cálculo con el email de la cuenta de servicio
5. Completá `.env`:

```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=ID_de_tu_planilla
```

El ID de la planilla está en la URL: `docs.google.com/spreadsheets/d/**ID**/edit`

---

## 7. Deploy en Railway (recomendado)

1. Subí el código a un repositorio GitHub
2. En https://railway.app → New Project → Deploy from GitHub
3. Seleccioná la carpeta `backend/`
4. Agregá las variables de entorno en el panel de Railway
5. Railway asigna un dominio automáticamente

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/contact` | Recibe un lead del formulario |
| POST | `/api/newsletter` | Suscribe un email al newsletter |
| GET | `/api/health` | Health check |
| GET | `/admin` | Panel de administración |
| GET | `/api/admin/contacts` | Lista leads (requiere auth) |
| GET | `/api/admin/subscribers` | Lista suscriptores (requiere auth) |
