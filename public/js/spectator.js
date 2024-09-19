// /js/spectator.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Escuchar el evento 'timeUpdate' del servidor
    socket.on('timeUpdate', (data) => {
        if (data.gameId === document.querySelector('title').textContent.split(': ')[1]) {
            const timerElement = document.getElementById('time-remaining');
            const timeLeft = data.timeLeft;

            // Calcula el tiempo restante en minutos y segundos
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    });

    // Escuchar el evento 'imageGenerated' del servidor
    socket.on('imageGenerated', function (data) {
        const imageDiv = document.getElementById('spectator-images');
        const img = document.createElement('img');
        img.src = data.imageUrl;
        img.alt = 'Imagen Generada';
        img.width = 300;
        imageDiv.appendChild(img);
    });
});
