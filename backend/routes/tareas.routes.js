const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareas.controller');

router.get('/', tareasController.obtenerTodas);
router.get('/:id', tareasController.obtenerPorId);
router.post('/', tareasController.crear);
router.put('/:id', tareasController.actualizar);
router.delete('/:id', tareasController.eliminar);

module.exports = router;