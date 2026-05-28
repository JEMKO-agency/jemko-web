const { google } = require('googleapis');

const ENABLED = process.env.GOOGLE_SHEETS_ENABLED === 'true';
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

/**
 * Devuelve un cliente autenticado de Google Sheets.
 * Usa Service Account (recomendado para server-to-server).
 */
function getClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

/**
 * Asegura que las hojas "Leads" y "Newsletter" existan.
 * Las crea si no están y agrega la fila de encabezados.
 */
async function ensureSheets(sheets) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = meta.data.sheets.map(s => s.properties.title);

  const toCreate = [];
  if (!existing.includes('Leads'))      toCreate.push({ addSheet: { properties: { title: 'Leads' } } });
  if (!existing.includes('Newsletter')) toCreate.push({ addSheet: { properties: { title: 'Newsletter' } } });

  if (toCreate.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: toCreate },
    });
    // Encabezados
    if (!existing.includes('Leads')) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Leads!A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Nombre', 'Empresa', 'Email', 'WhatsApp', 'Intereses', 'Mensaje', 'IP', 'Fecha']],
        },
      });
    }
    if (!existing.includes('Newsletter')) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Newsletter!A1:C1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Email', 'Fecha']],
        },
      });
    }
  }
}

/**
 * Agrega una fila en la hoja "Leads".
 * @param {object} contact - Registro de la tabla contacts
 */
async function appendContact(contact) {
  if (!ENABLED) return;
  try {
    const sheets = getClient();
    await ensureSheets(sheets);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Leads!A:I',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[
          contact.id,
          contact.nombre,
          contact.empresa  || '',
          contact.email,
          contact.whatsapp || '',
          contact.intereses || '',
          contact.mensaje  || '',
          contact.ip       || '',
          contact.created_at,
        ]],
      },
    });
    return true;
  } catch (err) {
    console.error('[Sheets] Error al escribir lead:', err.message);
    return false;
  }
}

/**
 * Agrega una fila en la hoja "Newsletter".
 * @param {object} subscriber - Registro de la tabla newsletter_subscribers
 */
async function appendSubscriber(subscriber) {
  if (!ENABLED) return;
  try {
    const sheets = getClient();
    await ensureSheets(sheets);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Newsletter!A:C',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[subscriber.id, subscriber.email, subscriber.created_at]],
      },
    });
    return true;
  } catch (err) {
    console.error('[Sheets] Error al escribir suscriptor:', err.message);
    return false;
  }
}

module.exports = { appendContact, appendSubscriber };
