const { Router } = require('express');
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const oficinaRoutes = require('./oficinaRoutes');
const usuarioOficinaRoutes = require('./usuarioOficinaRoutes');

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/usuarios', usuarioRoutes);
routes.use('/oficinas', oficinaRoutes);
routes.use('/usuario-oficinas', usuarioOficinaRoutes);

module.exports = routes;
