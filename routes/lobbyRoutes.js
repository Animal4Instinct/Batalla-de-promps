const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/authMiddleware');
const ensureAdmin = require('../middleware/ensureAdmin');
const lobbyController = require('../controllers/lobbyController');

// Mostrar el lobby
router.get('/', ensureAuthenticated, lobbyController.showLobby);

// Crear una nueva partida
router.post('/new-game', ensureAuthenticated, lobbyController.createGame);

// Unirse a una partida en curso
router.post('/join-game', ensureAuthenticated, lobbyController.joinGame);

// Mostrar la partida como espectador
router.get('/watch-game', ensureAuthenticated, lobbyController.watchGame);

// Iniciar una partida desde el lobby
router.post('/:id/start-game', ensureAuthenticated, ensureAdmin, lobbyController.startGame);

module.exports = router;
