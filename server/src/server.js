require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✨ Gold Receipt API running on http://localhost:${PORT}`);
  console.log(`📊 Data store: Google Sheets (ID: ${process.env.SPREADSHEET_ID})`);
});
