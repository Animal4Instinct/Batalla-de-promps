const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const handleError = require('../middleware/errorHandler');

// Mostrar la página de registro
router.get('/register', authController.showRegisterPage);

// Registro de usuario
router.post('/register', validateRegistration, handleError(authController.registerUser));

// Mostrar la página de login
router.get('/login', authController.showLoginPage);

// Login de usuario
router.post('/login',  validateLogin,   handleError(authController.loginUser));

// Logout del usuario
router.get('/logout', authController.logoutUser);

module.exports = router;
