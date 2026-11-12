require('dotenv').config({ path: __dirname + '/../server/.env' });
const app = require('../server/src/app');

module.exports = app;
