const startTimer = require('../utils/timer');

const gameSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Manejo del evento de unirse a un juego
    socket.on('joinGame', (gameId) => {
      socket.join(gameId);
      console.log(`Client joined game ${gameId}`);
    });

    // Manejo del evento de iniciar el juego
    socket.on('startGame', ({ gameId, gameTime }) => {
      startTimer(io, gameId, gameTime);
    });

    // Manejo del evento de iniciar la votación
    socket.on('startVoting', (gameId) => {
      io.to(gameId).emit('votingStarted');
    });

    // Manejo del evento de seleccionar al ganador
    socket.on('selectWinner', ({ gameId, winner }) => {
      io.to(gameId).emit('winnerSelected', { winner });
    });

    // Manejo de desconexiones de usuario
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

module.exports = gameSocket;
