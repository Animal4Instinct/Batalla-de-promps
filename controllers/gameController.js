const Game = require('../models/Game');

// Mostrar la página del juego
exports.getGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.findById(gameId).populate('topic').populate('player1').populate('player2'); // Asegúrate de poblar los jugadores

    if (!game) {
      return res.status(404).send('Juego no encontrado');
    }

    const now = new Date();
    let timeRemaining = game.gameTime * 60;

    if (game.status === 'in-progress') {
      const endTime = new Date(game.startTime.getTime() + game.gameTime * 60000);
      timeRemaining = Math.max(Math.floor((endTime - now) / 1000), 0);
    }

    const isAdmin = req.user && req.user.isAdmin;

    // Obtener nickName de los jugadores
    const player1NickName = game.player1 ? game.player1.nickName : 'Jugador 1';
    const player2NickName = game.player2 ? game.player2.nickName : 'Jugador 2';

    res.render('game', { 
      game, 
      user: req.user, 
      timeRemaining, 
      isAdmin,
      player1NickName,      
      player2NickName
    });
    console.log(player1NickName)
  } catch (err) {
    console.error('Error en el servidor:', err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Emite el tiempo restante a los clientes
exports.emitTimeRemaining = (game, io) => {
  if (!game) {
    throw new Error('No se ha proporcionado el juego para emitir el tiempo restante');
  }

  const endTime = new Date(game.startTime.getTime() + game.gameTime * 60000);
  const timeLeft = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);

  if (!io) {
    throw new Error('No se ha proporcionado el objeto io para emitir el tiempo restante');
  }

  io.to(game._id).emit('timeUpdate', { gameId: game._id, timeLeft });
};
