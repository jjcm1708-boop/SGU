const express = require('express');
const router = express.Router();

const {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
} = require('../controllers/empleados.controller');

const { verificarToken } = require('../middlewares/auth.middleware');

// Proteccion JWT
router.get('/', verificarToken, obtenerEmpleados);
router.post('/', verificarToken, crearEmpleado);
router.put('/:id', verificarToken, actualizarEmpleado);
router.delete('/:id', verificarToken, eliminarEmpleado);

module.exports = router;
