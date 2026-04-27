const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { ensureAuthenticated, authorize } = require('../middlewares/authMiddleware');

const router = Router();

router.use(ensureAuthenticated);

router.get('/', authorize('ADMIN'), usuarioController.list);
router.get('/:id', authorize('ADMIN'), usuarioController.findById);
router.post('/', authorize('ADMIN'), usuarioController.create);
router.put('/:id', authorize('ADMIN'), usuarioController.update);
router.post('/:id/ativar', authorize('ADMIN'), usuarioController.activate);
router.post('/:id/desativar', authorize('ADMIN'), usuarioController.deactivate);
router.post('/:id/senha', authorize('ADMIN'), usuarioController.changePassword);

module.exports = router;
