export const generateImage = (gameId, player, socket, maxImages, player1ImageCount, player2ImageCount) => {
    if (player === undefined) {
        console.error('Error: player is undefined');
        return;
    }

    if ((player === 'player1' && player1ImageCount >= maxImages) ||
        (player === 'player2' && player2ImageCount >= maxImages)) {
        alert('Has alcanzado el límite de imágenes.');
        return;
    }

    const prompt = document.getElementById(`input-${player}`).value;

    if (!prompt) {
        alert('Por favor ingresa un prompt.');
        return;
    }

    fetch(`/game/${gameId}/generate-image`, {
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

export const handleImageGenerated = (data, player1ImageCount, player2ImageCount) => {
    const imageDiv = document.getElementById(`images-${data.player}`);
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
};
