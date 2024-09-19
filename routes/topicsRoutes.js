const express = require('express');
const router = express.Router();
const topicsController = require('../controllers/topicsController');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Mostrar formulario para añadir un nuevo tema
router.get('/add', ensureAuthenticated, topicsController.showAddTopicForm);

// Añadir un nuevo tema
router.post('/add', ensureAuthenticated, topicsController.addTopic);

// Mostrar todos los temas
router.get('/', ensureAuthenticated, topicsController.getAllTopics);

// Redirigir al lobby
router.get('/lobby', ensureAuthenticated, topicsController.showLobby);

module.exports = router;
