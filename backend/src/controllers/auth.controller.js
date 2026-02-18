const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    console.log('BODY RECIBIDO:', req.body);

    const { email, password } = req.body;

    //Validacion
    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const [rows] = await db.query(
      'SELECT * FROM USUARIOS WHERE email = ?',
      [email]
    );

    console.log('RESULTADO QUERY:', rows);

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Usuario
    console.log('USUARIO BD:', usuario);

    // Contrase;a 
    const passwordValido = await bcrypt.compare(password, usuario.password);

    console.log('PASSWORD VALIDO:', passwordValido);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Token
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