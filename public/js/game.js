import { startRealTimeTimer, updateTimer } from './game/gameTimer.js';
import { vote, handleVoteUpdate } from './game/gameVote.js';
import { generateImage, handleImageGenerated } from './game/gameImage.js';


document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const gameId = '<%= game._id %>';
    let player1ImageCount = 0;
    let player2ImageCount = 0;
    const maxImages = <%= game.imageCount %> || 0;
    let timeRemaining = <%= timeRemaining %> || 0; // Tiempo restante en segundos

    // Iniciar el temporizador si el juego ha comenzado
    if ('<%= game.status %>' === 'in-progress') {
        const initialTimeRemaining = parseInt('<%= timeRemaining %>'); // Asegúrate de que esto sea un número
        startRealTimeTimer(socket, initialTimeRemaining, updateTimer);
    }
    // Event listeners para los botones
    document.getElementById('generate-player1').addEventListener('click', () => generateImage('player1'));
    document.getElementById('generate-player2').addEventListener('click', () => generateImage('player2'));
    document.getElementById('vote-player1').addEventListener('click', () => vote('player1'));
    document.getElementById('vote-player2').addEventListener('click', () => vote('player2'));

    // Manejadores de eventos de Socket.IO
    socket.on('timerUpdate', (data) => {
        if (data && data.timeRemaining !== undefined) {
            timeRemaining = data.timeRemaining || 0;
            updateTimer(); // Actualiza el temporizador en la vista
        }
    });

    socket.on('voteUpdate', (data) => {
        if (data && data.player1Votes !== undefined && data.player2Votes !== undefined) {
            document.getElementById('player1-votes').innerText = data.player1Votes || 0;
            document.getElementById('player2-votes').innerText = data.player2Votes || 0;
        }
    });

    socket.on('winnerSelected', (data) => {
        if (data && data.winner !== undefined) {
            alert(`El ganador es ${data.winner}`);
            document.getElementById('voting-section').classList.add('hidden');
            document.getElementById('select-winner-section').classList.add('hidden');
        }
    });

    socket.on('gameStarted', (data) => {
        if (data && data.gameId === gameId) {
            startRealTimeTimer();
        }
    });

    socket.on('gameEnded', (data) => {
        if (data && data.gameId === gameId) {
            alert('El tiempo ha terminado');
            handleTimerEnd();
        }
    });

    socket.on('votingStarted', () => {
        document.getElementById('voting-section').classList.remove('hidden');
        document.getElementById('select-winner-section').classList.remove('hidden');
    });

    socket.on('imageGenerated', (data) => {
        if (data && data.player !== undefined) {
            const imageDiv = document.getElementById(`images-${data.player}`);
            if (imageDiv) {
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
            }
        }
    })
});