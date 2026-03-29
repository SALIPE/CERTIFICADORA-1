const { Router } = require('express');
const oficinaController = require('../controllers/oficinaController');
const { ensureAuthenticated, authorize } = require('../middlewares/authMiddleware');

const router = Router();

router.use(ensureAuthenticated);

router.get('/', oficinaController.list);
router.get('/:id', oficinaController.findById);
router.post('/', authorize('ADMIN'), oficinaController.create);
router.put('/:id', authorize('ADMIN'), oficinaController.update);
router.patch('/:id/ativar', authorize('ADMIN'), oficinaController.activate);
router.patch('/:id/desativar', authorize('ADMIN'), oficinaController.deactivate);
router.patch('/:id/concluir', authorize('ADMIN'), oficinaController.finish);
router.get('/:id/voluntarios', oficinaController.listVolunteers);

module.exports = router;
