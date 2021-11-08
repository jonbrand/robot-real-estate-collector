const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  pool: {
    min: 0,
    max: 30,
  },
  useNullAsDefault: true,
});

module.exports = { db };
