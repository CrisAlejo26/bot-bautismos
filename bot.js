const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Token del bot de Telegram desde variables de entorno
const token = process.env.TELEGRAM_BOT_TOKEN;

// Verificar que el token esté definido
if (!token) {
  console.error(
    "Error: TELEGRAM_BOT_TOKEN no está definido en las variables de entorno"
  );
  process.exit(1);
}

// Crea una instancia del bot
const bot = new TelegramBot(token, { polling: true });

// Comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "¡Hola! Soy un bot de bautismos. Puedo ayudarte con información sobre bautismos y registros. Usa /ayuda para ver los comandos disponibles."
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
/id - Obtener tu ID de chat
/ver_suscritos - Ver lista de personas suscritas

Otras funciones:
- Envía "suscribir" para recibir notificaciones de personas perdidas
- Envía "desuscribir" para dejar de recibir notificaciones`
  );
});

// Comando /info
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "El bautismo es un sacramento importante en la vida cristiana. Representa el inicio de la vida en la fe y la entrada a la comunidad de creyentes."
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
    "15 de Mayo de 2025 - 10:00 AM",
    "12 de Junio de 2025 - 10:00 AM",
    "17 de Julio de 2025 - 10:00 AM",
  ];

  bot.sendMessage(
    chatId,
    `Próximas fechas de bautismo:\n\n${fechas.join("\n")}`
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

// Función para leer el archivo JSON de IDs de Telegram
function readTelegramIds() {
  const telegramIdsPath = path.join(__dirname, "config/telegram-ids.json");
  try {
    if (fs.existsSync(telegramIdsPath)) {
      const telegramIdsData = fs.readFileSync(telegramIdsPath, "utf8");
      const data = JSON.parse(telegramIdsData);

      // Migración de formato antiguo si es necesario
      if (
        data.adminChatIds &&
        Array.isArray(data.adminChatIds) &&
        !data.subscribers
      ) {
        data.subscribers = data.adminChatIds.map((id) => ({
          id,
          name: "Usuario",
        }));
      }

      // Asegurarse de que existe la propiedad subscribers
      if (!data.subscribers) {
        data.subscribers = [];
      }

      return data;
    } else {
      // Si el archivo no existe, crear una estructura básica
      return { adminChatIds: [], subscribers: [] };
    }
  } catch (error) {
    console.error("Error al leer el archivo de IDs de Telegram:", error);
    return { adminChatIds: [], subscribers: [] };
  }
}

// Función para escribir en el archivo JSON de IDs de Telegram
function writeTelegramIds(telegramIds) {
  const telegramIdsPath = path.join(__dirname, "config/telegram-ids.json");
  try {
    // Asegurarse de que el directorio existe
    const dirPath = path.dirname(telegramIdsPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Escribir el archivo
    fs.writeFileSync(
      telegramIdsPath,
      JSON.stringify(telegramIds, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("Error al escribir el archivo de IDs de Telegram:", error);
    return false;
  }
}

// Función para suscribir un chatId
function subscribeChatId(chatId, userName) {
  const telegramIds = readTelegramIds();
  const chatIdStr = chatId.toString();

  // Verificar si el chatId ya está en la lista de adminChatIds (compatibilidad)
  if (!telegramIds.adminChatIds.includes(chatIdStr)) {
    telegramIds.adminChatIds.push(chatIdStr);
  }

  // Verificar si el chatId ya está en la lista de subscribers
  const existingSubscriber = telegramIds.subscribers.find(
    (sub) => sub.id === chatIdStr
  );

  if (!existingSubscriber) {
    // Añadir a la lista de subscribers con nombre
    telegramIds.subscribers.push({
      id: chatIdStr,
      name: userName || "Usuario",
    });
    return writeTelegramIds(telegramIds);
  } else {
    // Actualizar el nombre si ha cambiado
    if (existingSubscriber.name !== userName && userName) {
      existingSubscriber.name = userName;
      return writeTelegramIds(telegramIds);
    }
  }

  return false; // Ya estaba suscrito y no hay cambios
}

// Función para desuscribir un chatId
function unsubscribeChatId(chatId) {
  const telegramIds = readTelegramIds();
  const chatIdStr = chatId.toString();
  let changed = false;

  // Verificar si el chatId está en la lista de adminChatIds (compatibilidad)
  const adminIndex = telegramIds.adminChatIds.indexOf(chatIdStr);
  if (adminIndex !== -1) {
    telegramIds.adminChatIds.splice(adminIndex, 1);
    changed = true;
  }

  // Verificar si el chatId está en la lista de subscribers
  const subscriberIndex = telegramIds.subscribers.findIndex(
    (sub) => sub.id === chatIdStr
  );
  if (subscriberIndex !== -1) {
    telegramIds.subscribers.splice(subscriberIndex, 1);
    changed = true;
  }

  if (changed) {
    return writeTelegramIds(telegramIds);
  }

  return false; // No estaba suscrito
}

// Manejar mensajes de texto que no son comandos
bot.on("message", (msg) => {
  if (!msg.text || !msg.text.startsWith("/")) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name || "";
    const messageText = msg.text.toLowerCase().trim();

    console.log(
      `Mensaje recibido de: ${firstName} ${lastName} (ID: ${userId}, Chat ID: ${chatId})`
    );

    // Palabra clave para suscribirse
    if (messageText === "suscribir") {
      const userName = `${firstName} ${lastName}`.trim();
      if (subscribeChatId(chatId, userName)) {
        bot.sendMessage(
          chatId,
          "✅ ¡Te has suscrito correctamente! Recibirás notificaciones cuando haya personas perdidas que necesiten ayuda."
        );
      } else {
        bot.sendMessage(
          chatId,
          "📝 Ya estás suscrito para recibir notificaciones de personas perdidas."
        );
      }
    }
    // Palabra clave para desuscribirse
    else if (messageText === "desuscribir") {
      if (unsubscribeChatId(chatId)) {
        bot.sendMessage(
          chatId,
          "❌ Te has desuscrito correctamente. Ya no recibirás notificaciones de personas perdidas."
        );
      } else {
        bot.sendMessage(
          chatId,
          "📝 No estabas suscrito a las notificaciones de personas perdidas."
        );
      }
    }
    // Ver lista de suscritos
    else if (messageText === "ver suscritos") {
      const telegramIds = readTelegramIds();

      if (telegramIds.subscribers && telegramIds.subscribers.length > 0) {
        const subscribersList = telegramIds.subscribers
          .map((sub) => `- ${sub.name}: ${sub.id}`)
          .join("\n");
        bot.sendMessage(
          chatId,
          `📋 Lista de personas suscritas:\n\n${subscribersList}`
        );
      } else {
        bot.sendMessage(chatId, "📋 No hay personas suscritas actualmente.");
      }
    }
    // Cualquier otro mensaje
    else {
      bot.sendMessage(
        chatId,
        'Lo siento, no entiendo ese mensaje. Usa /ayuda para ver los comandos disponibles o envía "suscribir" para recibir notificaciones de personas perdidas.'
      );
    }
  }
});

// Manejar errores
bot.on("polling_error", (error) => {
  console.error("Error en el polling:", error);
});

console.log("Bot de Telegram iniciado...");

module.exports = bot;
