const startTimer = require('../utils/timer'); // Cambiar a require para Node.js

const gameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinGame', (gameId) => {
      socket.join(gameId);
      console.log(`Client joined game ${gameId}`);
    });

    socket.on('startGame', ({ gameId, gameTime }) => {
      startTimer(io, gameId, gameTime);
      console.log(`El juego ${gameId} ha sido iniciado`);
    });

    socket.on('startVoting', (gameId) => {
      io.to(gameId).emit('votingStarted');
      console.log(`Comenzó la votación del juego ${gameId}`);
    });

    socket.on('selectWinner', ({ gameId, winner }) => {
      io.to(gameId).emit('winnerSelected', { winner });
      console.log(`El ganador fue ${winner}`);
    });

    socket.on('endGame', (gameId) => {
      io.to(gameId).emit('gameEnded');
      console.log(`El juego ${gameId} ha finalizado.`);
    });

    socket.on('endVoting', (gameId) => {
      io.to(gameId).emit('votingEnded');
      console.log(`La votación del juego ${gameId} ha finalizado.`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports = gameSocket; // Cambiar a module.exports para Node.js
