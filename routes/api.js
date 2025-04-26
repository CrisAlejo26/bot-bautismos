const express = require('express');
const router = express.Router();
const bot = require('../bot');

// Endpoint para recibir datos de personas perdidas y enviarlos al chat de Telegram
router.post('/persona-perdida', async (req, res) => {
  try {
    const { nombre, telefono, ubicacion, lat, lng, chatId } = req.body;
    
    // Validar que se proporcionen todos los datos necesarios
    if (!nombre || !telefono) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos. Se requiere nombre y teléfono.' 
      });
    }

    // Extraer latitud y longitud de la ubicación
    let latitude, longitude;
    
    // Caso 1: Se envían lat y lng como propiedades separadas
    if (lat !== undefined && lng !== undefined) {
      latitude = lat;
      longitude = lng;
    }
    // Caso 2: Se envía ubicacion como string "lat,lng"
    else if (typeof ubicacion === 'string' && ubicacion.includes(',')) {
      [latitude, longitude] = ubicacion.split(',').map(coord => coord.trim());
    }
    // Caso 3: Se envía ubicacion como objeto con propiedades lat y lng
    else if (ubicacion && ubicacion.lat && ubicacion.lng) {
      latitude = ubicacion.lat;
      longitude = ubicacion.lng;
    }
    // Si no se proporciona ninguna ubicación válida
    else {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de ubicación inválido. Debe proporcionar lat y lng como propiedades separadas, o ubicacion como "latitud,longitud" o como objeto con propiedades lat y lng.' 
      });
    }

    // Crear mensaje con los datos de la persona perdida
    const mensaje = `🆘 *HERMANO PERDIDO - NECESITA AYUDA* 🆘\n\n` +
                   `*Nombre:* ${nombre}\n` +
                   `*Teléfono:* ${telefono}\n\n` +
                   `Por favor, si puedes ayudar a esta persona para llegar a los bautismos, contacta con ella o utiliza el botón de ubicación para encontrarla.`;

    // Obtener la lista de IDs de chat a los que enviar el mensaje
    // Primero intentamos usar los IDs proporcionados en la petición
    let chatIds = [];
    
    // Si se proporciona un solo chatId en la petición
    if (chatId) {
      if (Array.isArray(chatId)) {
        chatIds = chatIds.concat(chatId);
      } else {
        chatIds.push(chatId);
      }
    }
    
    // Añadir IDs de chat configurados en variables de entorno
    // TELEGRAM_ADMIN_CHAT_IDS puede contener múltiples IDs separados por comas
    if (process.env.TELEGRAM_ADMIN_CHAT_IDS) {
      const envChatIds = process.env.TELEGRAM_ADMIN_CHAT_IDS.split(',').map(id => id.trim());
      chatIds = chatIds.concat(envChatIds);
    }


    
    // Si no hay IDs de chat válidos, guardamos la información pero no intentamos enviar el mensaje
    if (chatIds.length === 0) {
      console.log('No se proporcionaron IDs de chat válidos. Guardando información:', { nombre, telefono, ubicacion: `${latitude},${longitude}` });
      return res.status(200).json({
        success: true,
        message: 'Información recibida correctamente, pero no se envió a Telegram porque no hay IDs de chat configurados.'
      });
    }

    // Enviar mensaje a todos los IDs de chat configurados
    const messagePromises = [];
    const locationPromises = [];
    const successfulChats = [];
    const failedChats = [];
    
    // Preparar opciones para el mensaje
    const messageOptions = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📍 Ver ubicación en Google Maps',
              url: `https://www.google.com/maps?q=${latitude},${longitude}`
            }
          ]
        ]
      }
    };
    
    // Enviar mensajes a todos los chats
    for (const id of chatIds) {
      try {
        // Enviar mensaje con botón de ubicación
        messagePromises.push(
          bot.sendMessage(id, mensaje, messageOptions)
            .then(() => {
              successfulChats.push(id);
              console.log(`Mensaje enviado correctamente al chat ID: ${id}`);
            })
            .catch(err => {
              failedChats.push({ id, error: err.message });
              console.error(`Error al enviar mensaje al chat ID ${id}:`, err.message);
            })
        );
        
        // También enviamos la ubicación como un mensaje separado
        locationPromises.push(
          bot.sendLocation(id, latitude, longitude)
            .catch(err => {
              console.error(`Error al enviar ubicación al chat ID ${id}:`, err.message);
            })
        );
      } catch (err) {
        failedChats.push({ id, error: err.message });
        console.error(`Error al preparar mensaje para el chat ID ${id}:`, err.message);
      }
    }
    
    // Esperar a que se completen todos los envíos
    await Promise.allSettled([...messagePromises, ...locationPromises]);

    res.status(200).json({ 
      success: true, 
      message: 'Información procesada correctamente.', 
      details: {
        total: chatIds.length,
        successful: successfulChats.length,
        failed: failedChats.length,
        failedDetails: failedChats
      }
    });
  } catch (error) {
    console.error('Error al enviar información al bot:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar la solicitud.', 
      error: error.message 
    });
  }
});

module.exports = router;
