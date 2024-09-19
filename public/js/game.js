document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const gameId = '<%= game._id %>';
    let player1ImageCount = <%= game.images.filter(img => img.player === 'player1').length %>;
    let player2ImageCount = <%= game.images.filter(img => img.player === 'player2').length %>;
    const maxImages = <%= game.imageCount %>;
    let timeRemaining = <%= timeRemaining %>; // Tiempo restante en segundos
    let timerInterval;

    // Función para actualizar el temporizador
    const updateTimer = () => {
        const timerElement = document.getElementById('time-remaining');
        if (timeRemaining > 0) {
            timeRemaining--;
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerElement.innerText = ${minutes} minutos ${seconds} segundos;
        } else {
            clearInterval(timerInterval);
            handleTimerEnd();
        }
    };

    // Función para iniciar el temporizador en tiempo real
    const startRealTimeTimer = () => {
        document.getElementById('timer').classList.remove('hidden');
        timerInterval = setInterval(updateTimer, 1000);
    };

    // Función para manejar el final del temporizador
    const handleTimerEnd = () => {
        const votingMode = '<%= game.votingMode %>';
        if (votingMode === 'admin') {
            document.getElementById('select-winner-section').classList.remove('hidden');
        } else {
            document.getElementById('voting-section').classList.remove('hidden');
        }
        socket.emit('votingStarted');
    };

    // Función para registrar el voto del usuario
    const vote = (player) => {
        fetch(/game/${gameId}/vote, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al registrar tu voto. Por favor, intenta de nuevo.');
            });
    };

    // Función para generar una imagen
    const generateImage = (player) => {
        if ((player === 'player1' && player1ImageCount >= maxImages) ||
            (player === 'player2' && player2ImageCount >= maxImages)) {
            alert('Has alcanzado el límite de imágenes.');
            return;
        }

        const prompt = document.getElementById(input-${player}).value;

        if (!prompt) {
            alert('Por favor ingresa un prompt.');
            return;
        }

        fetch(/game/<%= game._id %>/generate-image, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ player, prompt })
        })
            .then(response => response.json())
            .then(data => {
                socket.emit('imageGenerated', { player, imageUrl: data.imageUrl });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al generar la imagen. Por favor, intenta de nuevo.');
            });
    };

    // Event listeners para los botones
    document.getElementById('generate-player1').addEventListener('click', () => generateImage('player1'));
    document.getElementById('generate-player2').addEventListener('click', () => generateImage('player2'));
    document.getElementById('vote-player1').addEventListener('click', () => vote('player1'));
    document.getElementById('vote-player2').addEventListener('click', () => vote('player2'));

    // Manejadores de eventos de Socket.IO
    socket.on('voteUpdate', (data) => {
        document.getElementById('player1-votes').innerText = data.player1Votes || 0;
        document.getElementById('player2-votes').innerText = data.player2Votes || 0;
    });

    socket.on('winnerSelected', (data) => {
        alert(El ganador es ${data.winner});
        document.getElementById('voting-section').classList.add('hidden');
        document.getElementById('select-winner-section').classList.add('hidden');
    });

    socket.on('gameStarted', (data) => {
        if (data.gameId === gameId) {
            const currentTime = new Date().getTime();
            const gameEndTime = new Date(data.startTime).getTime() + data.gameTime * 60000;
            timeRemaining = Math.floor((gameEndTime - currentTime) / 1000);
            startRealTimeTimer();
        }
    });

    socket.on('gameEnded', (data) => {
        if (data.gameId === gameId) {
            alert('El tiempo ha terminado');
            handleTimerEnd();
        }
    });

    socket.on('votingStarted', () => {
        document.getElementById('voting-section').classList.remove('hidden');
        document.getElementById('select-winner-section').classList.remove('hidden');
    });

    socket.on('imageGenerated', (data) => {
        const imageDiv = document.getElementById(images-${data.player});
        const img = document.createElement('img');
        img.src = data.imageUrl;
        img.alt = 'Imagen generada';
        img.width = 300;
        imageDiv.appendChild(img);

        if (data.player === 'player1') {
            player1ImageCount++;
            if (player1ImageCount >= maxImages) {
                document.getElementById('generate-player1').disabled = true;
            }
        } else if (data.player === 'player2') {
            player2ImageCount++;
            if (player2ImageCount >= maxImages) {
                document.getElementById('generate-player2').disabled = true;
            }
        }
    });

    // Iniciar el temporizador si el juego ha comenzado
    if ('<%= game.status %>' === 'in-progress') {
        startRealTimeTimer();
    }
});