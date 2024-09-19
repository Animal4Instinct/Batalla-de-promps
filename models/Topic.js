const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3, // Longitud mínima del título
    maxlength: 100, // Longitud máxima del título
    unique: true,  // Asegura que el título sea único
    trim: true, // Elimina espacios en blanco al inicio y al final
  },
});

// Índice único en el campo title para evitar duplicados
TopicSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model('Topic', TopicSchema);
