const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function crearAdmin() {
  const email = 'admin@sgu.com';
  const passwordPlano = '123456';

  const hash = await bcrypt.hash(passwordPlano, 10);

  await db.query('DELETE FROM USUARIOS WHERE email = ?', [email]);

  await db.query(
    'INSERT INTO USUARIOS (email, password, rol) VALUES (?, ?, ?)',
    [email, hash, 'admin_rh']
  );

  console.log('✅ Admin creado correctamente');
  process.exit();
}

crearAdmin();
