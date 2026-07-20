const { Client } = require('pg');
(async ()=>{
  try {
    let dbUrl = (process.env.DB_URL || '').replace('jdbc:postgresql://','');
    const qpos = dbUrl.indexOf('?'); if (qpos!==-1) dbUrl = dbUrl.substring(0,qpos);
    const slashPos = dbUrl.indexOf('/'); const hostPort = dbUrl.substring(0,slashPos); const database = dbUrl.substring(slashPos+1);
    const [host, port] = hostPort.split(':');
    const client = new Client({ host, port: port?parseInt(port):5432, database, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('pg_version:', (await client.query('select version()')).rows[0]);
    console.log('products pg_typeof(name):', (await client.query("select pg_typeof(name) as t, name from products limit 1")).rows);
    try { console.log('lower(name):', (await client.query('select lower(name) as low from products limit 1')).rows); } catch(e){ console.error('lower(name) failed:', e.message); }
    console.log('users pg_typeof(business_name):', (await client.query("select pg_typeof(business_name) as t, business_name from users limit 1")).rows);
    try { console.log('lower(business_name):', (await client.query('select lower(business_name) as low from users limit 1')).rows); } catch(e){ console.error('lower(business_name) failed:', e.message); }
    await client.end();
  } catch (e) { console.error(e); process.exit(1); }
})();
