const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Importar el bot de Telegram
const bot = require('./bot');

// Inicializar la aplicación Express
const app = express();

// Configuración de middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar motor de plantillas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas
app.get('/', (req, res) => {
  res.render('index', { title: 'Express App' });
});

// API routes
const apiRoutes = require('./routes/api');
const sheetsRoutes = require('./routes/sheets');
app.use('/api', apiRoutes);
app.use('/api/sheets', sheetsRoutes);

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error', 
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
