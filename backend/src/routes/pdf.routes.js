const express = require('express');
const router = express.Router();

const { descargarRecibo } = require('../controllers/pdf.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/recibo/:empleado_id', verificarToken, descargarRecibo);

module.exports = router;
