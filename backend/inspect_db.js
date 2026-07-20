#!/usr/bin/env node
const { Client } = require('pg');
(async ()=>{
  try {
    let dbUrl = (process.env.DB_URL || '').replace('jdbc:postgresql://','');
    const qpos = dbUrl.indexOf('?'); if (qpos!==-1) dbUrl = dbUrl.substring(0,qpos);
    const slashPos = dbUrl.indexOf('/'); const hostPort = dbUrl.substring(0,slashPos); const database = dbUrl.substring(slashPos+1);
    const [host, port] = hostPort.split(':');
    const client = new Client({ host, port: port?parseInt(port):5432, database, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query("select column_name, data_type, udt_name from information_schema.columns where table_name='products';");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) { console.error(e); process.exit(1); }
})();
