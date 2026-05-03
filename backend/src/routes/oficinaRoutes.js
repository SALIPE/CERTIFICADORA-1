const { Router } = require('express');
const oficinaController = require('../controllers/oficinaController');
const { ensureAuthenticated, authorize } = require('../middlewares/authMiddleware');

const router = Router();

router.use(ensureAuthenticated);

router.get('/minhas-inscricoes', authorize('VOLUNTARIO', 'ADMIN'), oficinaController.listarMinhasInscricoes);
router.get('/', oficinaController.list);
router.get('/:id', oficinaController.findById);
router.post('/', authorize('ADMIN'), oficinaController.create);
router.put('/:id', authorize('ADMIN'), oficinaController.update);
router.put('/:id/ativar', authorize('ADMIN'), oficinaController.activate);
router.put('/:id/desativar', authorize('ADMIN'), oficinaController.deactivate);
router.put('/:id/concluir', authorize('ADMIN'), oficinaController.finish);
router.get('/:id/voluntarios', oficinaController.listVolunteers);
router.post('/:id/inscrever', oficinaController.enroll);
router.delete('/:id/desinscrever', oficinaController.unenroll);

module.exports = router;
