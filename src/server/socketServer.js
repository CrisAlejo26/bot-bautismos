const socketIo = require('socket.io');

// Almacena los usuarios conectados
const connectedUsers = new Map();

/**
 * Inicializa el servidor de Socket.io
 * @param {Object} server - Servidor HTTP
 */
function initSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Evento de conexión
  io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);
    
    // Añadir usuario a la lista de conectados
    connectedUsers.set(socket.id, {
      id: socket.id,
      connectedAt: new Date()
    });
    
    // Emitir el número de usuarios conectados a todos los clientes
    emitUserCount(io);

    // Evento de desconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      
      // Eliminar usuario de la lista de conectados
      connectedUsers.delete(socket.id);
      
      // Emitir el número actualizado de usuarios conectados
      emitUserCount(io);
    });

    // Identificar usuario (opcional, para futuras mejoras)
    socket.on('identify', (userData) => {
      if (connectedUsers.has(socket.id)) {
        connectedUsers.set(socket.id, {
          ...connectedUsers.get(socket.id),
          ...userData
        });
        emitUserCount(io);
      }
    });
  });

  // Retornar la instancia de io para usarla en otras partes de la aplicación si es necesario
  return io;
}

/**
 * Emite el número de usuarios conectados a todos los clientes
 * @param {Object} io - Instancia de Socket.io
 */
function emitUserCount(io) {
  io.emit('user-count', {
    count: connectedUsers.size,
    timestamp: new Date()
  });
}

/**
 * Obtiene el número de usuarios conectados
 * @returns {number} Número de usuarios conectados
 */
function getConnectedUsersCount() {
  return connectedUsers.size;
}

/**
 * Obtiene la lista de usuarios conectados
 * @returns {Array} Lista de usuarios conectados
 */
function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

module.exports = {
  initSocketServer,
  getConnectedUsersCount,
  getConnectedUsers
};
