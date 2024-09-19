const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate de tener el modelo de usuario

const ensureAuthenticated = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.error('No token found in cookies');
    return res.redirect('/auth/login'); // Redirige si no hay token
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.user?._id) {
      console.error('El token no contiene un user ID válido');
      throw new Error('Token inválido');
    }

    // Extraer el ID del usuario del token decodificado
    const userId = decoded.user._id;

    // Buscar al usuario en la base de datos
    const user = await User.findById(userId);

    if (!user) {
      console.error('Usuario no encontrado en la base de datos');
      throw new Error('Usuario no encontrado');
    }

    // Asignar el usuario a la solicitud para que esté disponible en las rutas posteriores
    req.user = user;
    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);

    // Opción de redirigir al login o devolver un error JSON si es API
    if (req.is('json')) {
      return res.status(401).json({ error: 'Error de autenticación. Por favor, inicia sesión de nuevo.' });
    }
    
    return res.redirect('/auth/login'); // Redirige en caso de error con el token o usuario
  }
};

module.exports = ensureAuthenticated;
