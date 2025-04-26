const app = require('./app');
const http = require('http');

// Obtener el puerto del entorno o usar el 3000 por defecto
const port = process.env.PORT || 3002;
const host = process.env.HOST || '0.0.0.0';
app.set('port', port);

// Crear el servidor HTTP
const server = http.createServer(app);

// Escuchar en el puerto especificado
server.listen(port, host);  

// Manejar eventos del servidor
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // Manejar errores específicos con mensajes amigables
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requiere privilegios elevados');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' ya está en uso');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Servidor escuchando en ' + bind);
});
