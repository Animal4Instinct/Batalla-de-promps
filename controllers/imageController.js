const Game = require('../models/Game');
const axios = require('axios');
const mongoose = require('mongoose');

// Generar imágenes
const generateImage = async (req, res) => {
  const { prompt } = req.body;
  const gameId = req.params.id;
  const player = req.user ? req.user._id : null; // Obtener el ID del jugador del usuario autenticado

  try {
    // Validar ID de juego
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).send('ID de juego inválido');
    }

    // Buscar el juego en la base de datos
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'in-progress') {
      return res.status(400).send('La partida no está en progreso');
    }

    // Validar el prompt
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).send('El prompt no puede estar vacío');
    }

    // Validar que el jugador está en la partida
    if (!game.player1.equals(player) && !game.player2.equals(player)) {
      return res.status(403).send('No estás autorizado para generar una imagen en esta partida');
    }

    // Generar imagen usando el API
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

    try {
      const response = await axios.get(imageUrl, { timeout: 15000 }); // Tiempo de espera de 15 segundos
      if (response.status === 200) {
        const generatedImageUrl = response.request.res.responseUrl; // Extraer la URL de la imagen generada

        // Guardar la imagen generada en el juego
        game.images.push({ player, imageUrl: generatedImageUrl });
        await game.save();

        // Emitir el evento a través de Socket.IO
        req.app.get('io').to(gameId).emit('imageGenerated', { player, imageUrl: generatedImageUrl });

        // Responder con la URL de la imagen generada
        res.json({ imageUrl: generatedImageUrl });
      } else {
        res.status(response.status).send('Error al generar la imagen');
      }
    } catch (apiError) {
      console.error('Error al llamar a la API de generación de imágenes:', apiError.message);
      res.status(500).send('Error en la generación de imágenes');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al procesar la solicitud');
  }
};

module.exports = { generateImage };
