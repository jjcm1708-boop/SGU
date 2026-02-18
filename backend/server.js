const express = require('express');
const db = require('./src/config/db');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS test');
    res.json({
      mensaje: 'Backend y MySQL funcionando',
      db: rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error conectando a la base de datos' });
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});


const { verificarToken } = require('./src/middlewares/auth.middleware');

app.get('/api/privado', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Accediste a una ruta protegida',
    usuario: req.usuario
  });
});


const empleadosRoutes = require('./src/routes/empleados.routes');

app.use('/api/empleados', empleadosRoutes);


const asistenciasRoutes = require('./src/routes/asistencias.routes');
app.use('/api/asistencias', asistenciasRoutes);


const nominaRoutes = require('./src/routes/nomina.routes');
app.use('/api/nomina', nominaRoutes);

const pdfRoutes = require('./src/routes/pdf.routes');
app.use('/api/pdf', pdfRoutes);


const vacacionesRoutes = require('./src/routes/vacaciones.routes');
app.use('/api/vacaciones', vacacionesRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);