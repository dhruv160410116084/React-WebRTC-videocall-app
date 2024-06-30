const Pool = require('pg').Pool

require('dotenv').config();
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);

const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: 5432,
  ssl:true
})

module.exports= pool