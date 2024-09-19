const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const gameSocket = require('./public/socket/gameSocket');
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware'); // Asegúrate de que este archivo existe

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Conectar a MongoDB
try {
  connectDB();
} catch (err) {
  console.error('Error al conectar a MongoDB:', err.message);
  process.exit(1);
}

// Configuración de express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Configuración de connect-flash
app.use(flash());

// Middleware para mensajes flash
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Middlewares generales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Archivos estáticos y vistas
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io);

// Rutas
app.use('/auth', require('./routes/authRoutes')); // Corrige el nombre del archivo aquí
app.use('/lobby', authMiddleware, require('./routes/lobbyRoutes')); // Usa authMiddleware aquí
app.use('/topics', authMiddleware, require('./routes/topicsRoutes')); // Usa authMiddleware aquí
app.use('/game', authMiddleware, require('./routes/gameRoutes')); // Usa authMiddleware aquí

// Redirección en la raíz
app.get('/', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      res.redirect('/lobby');
    } catch (err) {
      console.error('Token inválido:', err.message);
      res.redirect('/auth/login');
    }
  } else {
    res.redirect('/auth/login');
  }
});

// Inicializar Socket.IO
try {
  gameSocket(io);
} catch (err) {
  console.error('Error al inicializar Socket.IO:', err.message);
}

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});