export const vote = (gameId, player) => {
    if (player === undefined) {
        console.error('Error: player is undefined');
        return;
    }

    fetch(`/game/${gameId}/vote`, {
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

export const handleVoteUpdate = (data) => {
    document.getElementById('player1-votes').innerText = data.player1Votes || 0;
    document.getElementById('player2-votes').innerText = data.player2Votes || 0;
};
