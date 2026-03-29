const { Router } = require('express');
const usuarioOficinaController = require('../controllers/usuarioOficinaController');
const { ensureAuthenticated, authorize } = require('../middlewares/authMiddleware');

const router = Router();

router.use(ensureAuthenticated);

router.get('/', authorize('ADMIN'), usuarioOficinaController.list);
router.get('/:id', authorize('ADMIN'), usuarioOficinaController.findById);
router.get('/usuario/:usuarioId', usuarioOficinaController.listByUser);
router.get('/oficina/:oficinaId', usuarioOficinaController.listByOffice);
router.post('/', authorize('ADMIN'), usuarioOficinaController.create);
router.put('/:id', authorize('ADMIN'), usuarioOficinaController.update);
router.patch('/:id/presenca', authorize('ADMIN'), usuarioOficinaController.registerPresence);
router.patch('/:id/falta', authorize('ADMIN'), usuarioOficinaController.registerAbsence);
router.patch('/:id/reativar', authorize('ADMIN'), usuarioOficinaController.reactivate);
router.patch('/:id/desvincular', authorize('ADMIN'), usuarioOficinaController.unlink);

module.exports = router;
