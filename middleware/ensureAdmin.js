module.exports = function ensureAdmin(req, res, next) {
  // Verifica si req.user existe y si es un admin
  if (req.user && req.user.isAdmin) {
    return next();
  }

  // Opcional: agregar un mensaje de error
  req.flash('error', 'Acceso denegado. Se requiere privilegios de administrador.');

  // Redirige a la página principal o a una página de error
  res.redirect('/lobby'); // O redirige a otro lugar si prefieres
};
