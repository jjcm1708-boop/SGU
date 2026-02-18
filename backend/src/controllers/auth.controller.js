const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    // 🔍 Ver qué datos llegan desde el frontend/Postman
    console.log('BODY RECIBIDO:', req.body);

    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario en la base de datos
    const [rows] = await db.query(
      'SELECT * FROM USUARIOS WHERE email = ?',
      [email]
    );

    console.log('RESULTADO QUERY:', rows);

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // 🔍 Ver usuario encontrado
    console.log('USUARIO BD:', usuario);

    // Comparar contraseña ingresada con hash guardado
    const passwordValido = await bcrypt.compare(password, usuario.password);

    console.log('PASSWORD VALIDO:', passwordValido);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token
    });

  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sIjoiYWRtaW5fcmgiLCJpYXQiOjE3NzEzNzM2NDQsImV4cCI6MTc3MTQwMjQ0NH0.ICAlaeAE5w5kCDtoZ9ji11Baqh47wEby5e8V3bYKyuw