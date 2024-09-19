const jwt = require('jsonwebtoken');
const User = require('../models/User');

/// Mostrar la página de registro
const showRegisterPage = (req, res) => {
  res.render('register', {
    errorMessage: req.flash('error'),
    successMessage: req.flash('success')
  });
};


// Registro de usuario
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      req.flash('error', 'Usuario ya registrado');
      return res.redirect('/auth/register');
    }

    const newUser = new User({ name, email, password, isAdmin: isAdmin || false });
    await newUser.save();

    req.flash('success', 'Registro exitoso, por favor inicia sesión');
    res.redirect('/auth/login');
  } catch (err) {
    next(err);
  }
};

// Mostrar la página de login
const showLoginPage = (req, res) => {
  res.render('login', {
    errorMessage: req.flash('error'),
    successMessage: req.flash('success')
  });
};

// Login de usuario
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Credenciales inválidas');
      return res.redirect('/auth/login');
    }

    // Cambiar 'user.id' a 'user._id'
    const payload = { user: { _id: user._id, name: user.name, isAdmin: user.isAdmin } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Almacenar el token en la cookie
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hora
    res.redirect('/lobby');
  } catch (err) {
    next(err);
  }
};


// Logout del usuario
const logoutUser = (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'Has cerrado sesión exitosamente');
  res.redirect('/auth/login');
};

module.exports = {
  showRegisterPage,
  registerUser,
  showLoginPage,
  loginUser,
  logoutUser
};
