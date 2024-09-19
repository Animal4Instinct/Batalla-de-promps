const Game = require('../models/Game');
const Topic = require('../models/Topic');
const User = require('../models/User');
const startTimer = require('../public/utils/timer');

// Mostrar el lobby
exports.showLobby = async (req, res) => {
  try {
    const [games, topics] = await Promise.all([
      Game.find({ status: { $ne: 'completed' } })
        .populate('topic')
        .populate('player1') // Poblar jugador 1
        .populate('player2'), // Poblar jugador 2
      Topic.find()
    ]);

    // Verifica si se han encontrado temas
    if (!topics || topics.length === 0) {
      console.log('No hay temas disponibles');
    }

    res.render('lobby', { user: req.user, games, topics });
  } catch (err) {
    console.error(`Error en showLobby: ${err.message}`);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear una nueva partida
exports.createGame = async (req, res) => {
  const { gameTime, imageCount, votingMode, playerNick } = req.body;

  try {
    // Obtener todos los temas disponibles
    const topics = await Topic.find();
    if (!topics.length) {
      return res.status(404).send('No hay temas disponibles');
    }

    // Seleccionar un tema aleatorio
    const topic = topics[Math.floor(Math.random() * topics.length)];

    // Actualizar el nickName del usuario autenticado si se proporciona
    if (playerNick) {
      await User.findByIdAndUpdate(req.user._id, { nickName: playerNick });
    }

    // Crear el juego
    const game = new Game({
      topic: topic._id,
      status: 'waiting',
      gameTime: Math.min(gameTime, 3),
      imageCount: Math.min(imageCount, 3),
      votingMode: votingMode === 'admin' ? 'admin' : 'public',
      player1: req.user._id // Asignar el usuario actual como el jugador 1
    });

    // Guardar el juego
    await game.save();

    res.redirect(`/game/${game._id}`);
  } catch (err) {
    console.error('Error al crear la partida:', err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Unirse a una partida en curso
exports.joinGame = async (req, res) => {
  const { gameId, playerNick } = req.body;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).send('Partida no encontrada');
    }

    // Actualizar el nickName del usuario autenticado si se proporciona
    if (playerNick) {
      await User.findByIdAndUpdate(req.user._id, { nickName: playerNick });
    }

    if (!game.player1) {
      game.player1 = req.user._id;
    } else if (!game.player2) {
      game.player2 = req.user._id;
      // game.status = 'in-progress'; // Cambiar el estado de la partida cuando ambos jugadores están presentes
    } else {
      return res.status(400).send('La partida ya tiene dos jugadores');
    }

    await game.save();
    res.redirect(`/game/${game._id}`);
  } catch (err) {
    console.error('Error al unirse a la partida:', err.message);
    res.status(500).send('Error al unirse a la partida');
  }
};

// Mostrar la partida como espectador
exports.watchGame = async (req, res) => {
  const { gameId } = req.query;

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

    res.render('spectator', { game, user: req.user, timeLeft });
  } catch (err) {
    console.error('Error al ver la partida:', err.message);
    res.status(500).json({ error: 'Error al ver la partida' });
  }
};

// Iniciar una partida desde el lobby
exports.startGame = async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).send('Juego no encontrado');
    }

    // Cambiar el estado a "in-progress" y establecer la hora de inicio
    game.status = 'in-progress';
    game.startTime = new Date(); // Establecer el tiempo de inicio
    await game.save();

    // Emitir el evento de inicio de partida a todos los clientes conectados
    req.app.get('io').emit('gameStarted', {
      gameId: game._id,
      startTime: game.startTime,
      gameTime: game.gameTime
    });

    // Iniciar el temporizador
    startTimer(req.app.get('io'), game._id.toString(), game.gameTime, (id) => {
      req.app.get('io').emit('gameEnded', { gameId: id });
    });

    res.redirect(`/game/${game._id}`);
  } catch (err) {
    console.error('Error al iniciar la partida:', err.message);
    res.status(500).send('Error al iniciar la partida');
  }
};
