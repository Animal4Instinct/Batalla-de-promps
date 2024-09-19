export const startRealTimeTimer = (socket, timeRemaining, updateTimer) => {
    document.getElementById('timer').classList.remove('hidden');
    const timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimer(timeRemaining);
        } else {
            clearInterval(timerInterval);
            handleTimerEnd(socket);
        }
    }, 1000);
};

export const updateTimer = (timeRemaining) => {
    const timerElement = document.getElementById('time-remaining');
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerElement.innerText = `${minutes} minutos ${seconds} segundos`;
};

const handleTimerEnd = (socket) => {
    const votingMode = '<%= game.votingMode %>';
    if (votingMode === 'admin') {
        document.getElementById('select-winner-section').classList.remove('hidden');
    } else {
        document.getElementById('voting-section').classList.remove('hidden');
    }
    socket.emit('votingStarted');
};
