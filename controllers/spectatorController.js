const Game = require('../models/Game');
const mongoose = require('mongoose');

// Mostrar la partida como espectador
const watchGame = async (req, res) => {
  const { gameId } = req.query;

  // Validar gameId
  if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).send('ID de juego inválido');
  }

  try {
    const game = await Game.findById(gameId).populate('topic');
    if (!game) {
      return res.status(404).send('Juego no encontrado');
    }

    // Calcular el tiempo restante
    const currentTime = new Date();
    let timeLeft = 0;
    if (game.status === 'in-progress') {
      const endTime = new Date(game.startTime.getTime() + game.gameTime * 60000);
      timeLeft = Math.max(Math.floor((endTime - currentTime) / 1000), 0); // en segundos
    }

    // Verificar si el usuario está autorizado para ver el juego (opcional)
    const isAuthorized = req.user ? (game.player1.equals(req.user._id) || game.player2.equals(req.user._id) || req.user.isAdmin) : false;

    // Renderizar la página para el espectador
    res.render('spectator', { game, user: req.user, timeLeft, isAuthorized });
  } catch (err) {
    console.error('Error al ver la partida:', err.message);
    res.status(500).json({ error: 'Error al ver la partida' });
  }
};

module.exports = { watchGame };
