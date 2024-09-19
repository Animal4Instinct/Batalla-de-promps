const express = require('express');
const router = express.Router();

const gameController = require('../controllers/gameController');
const imageController = require('../controllers/imageController');
const spectatorController = require('../controllers/spectatorController');
const votingController = require('../controllers/votingController');

// Middleware para autenticación y autorización
const ensureAdmin = require('../middleware/ensureAdmin');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Ruta para obtener la página del juego
router.get('/:id', ensureAuthenticated, gameController.getGame);

// Ruta para generar una imagen
router.post('/:id/generate-image', ensureAuthenticated, imageController.generateImage);

// Ruta para ver la partida como espectador
router.get('/spectator', ensureAuthenticated, spectatorController.watchGame);

// Ruta para mostrar el resultado de la votación pública
router.get('/:id/show-result', ensureAuthenticated, votingController.showResult);

// Ruta para terminar el juego y comenzar la votación pública
router.post('/:id/end', ensureAuthenticated, ensureAdmin, votingController.endGame);

// Ruta para seleccionar el ganador manualmente
router.post('/:id/select-winner', ensureAuthenticated, ensureAdmin, votingController.selectWinner);

// Ruta para votar en la votación pública
router.post('/:id/vote', ensureAuthenticated, votingController.vote);

module.exports = router;
