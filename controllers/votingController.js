const Game = require('../models/Game');
const mongoose = require('mongoose');

// Mostrar el resultado de la votación pública
exports.showResult = async (req, res) => {
  const { id: gameId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).send('ID de juego inválido');
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).send('Juego no encontrado');
    }

    if (game.status !== 'voting') {
      return res.status(400).send('La votación no está activa.');
    }

    if (Date.now() <= game.votingEndTime) {
      return res.status(400).send('La votación aún está en curso.');
    }

    const winner = game.player1Votes > game.player2Votes ? 'player1' : 'player2';

    game.winner = winner;
    game.status = 'completed';
    await game.save();

    req.app.get('io').to(gameId).emit('winnerSelected', { winner });

    res.json({ message: 'Votación completada', winner });
  } catch (err) {
    console.error('Error al mostrar el resultado:', err.message);
    res.status(500).send('Error al mostrar el resultado');
  }
};


// Manejar el fin del juego y comenzar la votación pública
exports.endGame = async (req, res) => {
  const { id: gameId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).send('ID de juego inválido');
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).send('Juego no encontrado');
    }

    if (game.status !== 'in-progress') {
      return res.status(400).send('El juego no está en progreso.');
    }

    // Verificar si el usuario es un administrador (opcional)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send('No tienes permisos para finalizar el juego.');
    }

    game.status = 'voting';
    game.votingEndTime = Date.now() + 60000; // 1 minuto en milisegundos
    await game.save();

    req.app.get('io').to(gameId).emit('votingStarted');

    res.json({ message: 'Votación pública iniciada', votingEndTime: game.votingEndTime });
  } catch (err) {
    console.error('Error al terminar el juego:', err.message);
    res.status(500).send('Error al terminar el juego');
  }
};


// Ruta para seleccionar el ganador manualmente
exports.selectWinner = async (req, res) => {
  const { id: gameId } = req.params;
  const { winner } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).send('ID de juego inválido');
    }

    if (!['player1', 'player2'].includes(winner)) {
      return res.status(400).send('Ganador inválido');
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).send('Partida no encontrada');
    }

    // Verificar si el usuario es un administrador (opcional)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).send('No tienes permisos para seleccionar el ganador.');
    }

    game.winner = winner;
    game.endTime = new Date();
    game.status = 'completed';

    await game.save();

    req.app.get('io').to(gameId).emit('winnerSelected', { winner });

    req.flash('success', `El ganador es ${winner}.`);
    res.redirect('/lobby');
  } catch (err) {
    console.error('Error al finalizar la partida:', err.message);
    req.flash('error', 'Error al finalizar la partida');
    res.redirect('/lobby');
  }
};


// Manejar votación pública
exports.vote = async (req, res) => {
  const { id: gameId } = req.params;
  const { player } = req.body;
  const userIp = req.ip;

  try {
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).send('ID de juego inválido');
    }

    if (!['player1', 'player2'].includes(player)) {
      return res.status(400).send('Jugador inválido');
    }

    const game = await Game.findById(gameId);

    if (!game || game.status !== 'voting') {
      return res.status(400).json({ message: 'La votación no está disponible en este momento.' });
    }

    if (game.voters.includes(userIp)) {
      return res.status(400).json({ message: 'Ya has votado.' });
    }

    if (Date.now() > game.votingEndTime) {
      return res.status(400).json({ message: 'El tiempo de votación ha terminado.' });
    }

    if (player === 'player1') {
      game.player1Votes = (game.player1Votes || 0) + 1;
    } else if (player === 'player2') {
      game.player2Votes = (game.player2Votes || 0) + 1;
    }

    game.voters.push(userIp);
    await game.save();

    req.app.get('io').to(gameId).emit('voteUpdate', { player1Votes: game.player1Votes, player2Votes: game.player2Votes });

    res.json({ message: 'Voto registrado', votes: { player1: game.player1Votes, player2: game.player2Votes } });
  } catch (err) {
    console.error('Error al registrar el voto:', err.message);
    res.status(500).send('Error al registrar el voto');
  }
};
