const startTimer = (io, gameId, gameTime, onTimeExpired) => {
  const interval = 1000; // Intervalo de actualización en milisegundos
  const endTime = new Date(Date.now() + gameTime * 60000); // Tiempo de finalización

  const timerInterval = setInterval(() => {
    const timeLeft = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);
    io.to(gameId).emit('timerUpdate', { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      io.to(gameId).emit('timeExpired');
      if (typeof onTimeExpired === 'function') {
        onTimeExpired(gameId); // Llamar al callback cuando el tiempo expire
      }
    }
  }, interval);
};

module.exports = startTimer;
