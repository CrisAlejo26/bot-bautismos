// Cliente Socket.io para mostrar usuarios en línea
document.addEventListener('DOMContentLoaded', () => {
  // Conectar al servidor Socket.io
  // La URL será la misma que la del servidor, por ejemplo: http://localhost:3002
  const socket = io();
  
  // Elemento para mostrar el contador de usuarios
  const userCountElement = document.getElementById('online-users-count');
  
  // Escuchar el evento 'user-count' del servidor
  socket.on('user-count', (data) => {
    if (userCountElement) {
      userCountElement.textContent = data.count;
      
      // Opcional: Mostrar la hora de la última actualización
      const timestamp = new Date(data.timestamp);
      console.log(`Usuarios en línea: ${data.count} (actualizado a las ${timestamp.toLocaleTimeString()})`);
    }
  });
  
  // Evento de conexión exitosa
  socket.on('connect', () => {
    console.log('Conectado al servidor Socket.io');
    
    // Opcional: Identificar al usuario (puedes enviar información adicional)
    // socket.emit('identify', { userId: 'user123', name: 'Usuario Ejemplo' });
  });
  
  // Evento de desconexión
  socket.on('disconnect', () => {
    console.log('Desconectado del servidor Socket.io');
  });
});
