const { body, validationResult } = require('express-validator');
const User = require('../models/User'); 

// Validación para el registro de usuario
const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(error => error.msg).join(', '));
      return res.redirect('/auth/register');
    }
    next();
  }
];

// Validación para el inicio de sesión

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email').bail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Email or password is incorrect');
      }
    }),
  body('password').notEmpty().withMessage('Password is required').bail()
    .custom(async (password, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      if (!user || !(await user.matchPassword(password))) {
        throw new Error('Email or password is incorrect');
      }
      req.user = user;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(error => error.msg));
      return res.redirect('/auth/login');
    }
    next();
  }
];

module.exports = { validateRegistration, validateLogin };
