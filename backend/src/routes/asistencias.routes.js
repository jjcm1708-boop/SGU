const express = require('express');
const router = express.Router();

const {
  marcarEntrada,
  marcarSalida,
  obtenerAsistencias
} = require('../controllers/asistencias.controller');

const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/entrada', verificarToken, marcarEntrada);
router.post('/salida', verificarToken, marcarSalida);
router.get('/', verificarToken, obtenerAsistencias);

module.exports = router;
