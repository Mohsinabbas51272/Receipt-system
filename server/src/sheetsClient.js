/**
 * Google Sheets integration helper
 * Handles authentication and provides sheets client
 */

const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

let _sheetsClient = null;

function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;

  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'http://localhost:3333/oauth2callback');
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  _sheetsClient = google.sheets({ version: 'v4', auth: oAuth2Client });
  return _sheetsClient;
}

module.exports = { getSheetsClient };

