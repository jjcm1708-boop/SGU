const express = require('express');
const router = express.Router();
const vacacionesController = require('../controllers/vacaciones.controller');

router.post('/', vacacionesController.solicitarVacaciones);
router.get('/', vacacionesController.listarSolicitudes);
router.put('/aprobar/:id', vacacionesController.aprobarVacaciones);
router.put('/rechazar/:id', vacacionesController.rechazarVacaciones);
router.get('/disponibles/:empleado_id', vacacionesController.diasDisponibles);


module.exports = router;
