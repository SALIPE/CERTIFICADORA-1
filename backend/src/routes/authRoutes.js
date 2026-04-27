const { Router } = require('express');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');

const router = Router();

router.post('/login', authController.login);
router.post('/cadastro-voluntario', usuarioController.createVoluntario);

module.exports = router;
