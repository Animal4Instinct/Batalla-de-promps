const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,  // Mantener opcional si no siempre se tiene un segundo jugador desde el inicio
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,    // Se puede añadir cuando el segundo jugador se une
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  images: [{
    player: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    imageUrl: String
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'voting', 'completed'],
    default: 'waiting',
  },
  gameTime: {
    type: Number,
    default: 3,
  },
  imageCount: {
    type: Number,
    default: 1,
  },
  votingMode: {
    type: String,
    enum: ['public', 'admin'],
    default: 'admin',
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  votingEndTime: {
    type: Date,
    default: null,
  },
  voters: [{
    type: String, // Si guardas IPs u otros identificadores
  }],
  spectators: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
});

// Índices
GameSchema.index({ status: 1 });
GameSchema.index({ topic: 1 });
GameSchema.index({ winner: 1 });

const Game = mongoose.model('Game', GameSchema);

module.exports = Game;
