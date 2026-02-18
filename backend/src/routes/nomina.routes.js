const express = require('express');
const router = express.Router();

const { calcularNomina } = require('../controllers/nomina.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/:empleado_id', verificarToken, calcularNomina);

module.exports = router;
