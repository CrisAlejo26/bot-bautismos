const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Token del bot de Telegram desde variables de entorno
const token = process.env.TELEGRAM_BOT_TOKEN;

// Verificar que el token esté definido
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN no está definido en las variables de entorno');
  process.exit(1);
}

// Crea una instancia del bot
const bot = new TelegramBot(token, { polling: true });

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId, 
    '¡Hola! Soy un bot de bautismos. Puedo ayudarte con información sobre bautismos y registros. Usa /ayuda para ver los comandos disponibles.'
  );
});

// Comando /ayuda
bot.onText(/\/ayuda/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Comandos disponibles:
    
/start - Iniciar el bot
/ayuda - Mostrar esta ayuda
/info - Información sobre bautismos
/requisitos - Requisitos para bautismo
/fecha - Consultar próximas fechas de bautismo
/contacto - Información de contacto
/id - Obtener tu ID de chat`
  );
});

// Comando /info
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'El bautismo es un sacramento importante en la vida cristiana. Representa el inicio de la vida en la fe y la entrada a la comunidad de creyentes.'
  );
});

// Comando /requisitos
bot.onText(/\/requisitos/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Requisitos para el bautismo:
    
1. Partida de nacimiento del niño/a
2. Datos de los padrinos
3. Asistencia de los padres y padrinos a la charla pre-bautismal
4. Completar el formulario de solicitud
5. Realizar la donación correspondiente`
  );
});

// Comando /fecha
bot.onText(/\/fecha/, (msg) => {
  const chatId = msg.chat.id;
  
  // Aquí podrías obtener fechas desde una base de datos
  const fechas = [
    '15 de Mayo de 2025 - 10:00 AM',
    '12 de Junio de 2025 - 10:00 AM',
    '17 de Julio de 2025 - 10:00 AM'
  ];
  
  bot.sendMessage(
    chatId,
    `Próximas fechas de bautismo:\n\n${fechas.join('\n')}`
  );
});

// Comando /contacto
bot.onText(/\/contacto/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Para más información, contacta con la parroquia:
    
📞 Teléfono: +34 XXX XXX XXX
✉️ Email: parroquia@ejemplo.com
🏢 Dirección: Calle Ejemplo, 123, Ciudad
⏰ Horario de atención: Lunes a Viernes de 9:00 a 13:00`
  );
});

// Comando /id para obtener el ID del chat
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Tu ID de chat es: ${chatId}\n\nGuarda este número para configurar el bot correctamente.`
  );
});

// Manejar mensajes de texto que no son comandos
bot.on('message', (msg) => {
  if (!msg.text || !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name || '';
    
    console.log(`Mensaje recibido de: ${firstName} ${lastName} (ID: ${userId}, Chat ID: ${chatId})`);
    
    bot.sendMessage(
      chatId,
      'Lo siento, no entiendo ese mensaje. Usa /ayuda para ver los comandos disponibles.'
    );
  }
});

// Manejar errores
bot.on('polling_error', (error) => {
  console.error('Error en el polling:', error);
});

console.log('Bot de Telegram iniciado...');

module.exports = bot;
