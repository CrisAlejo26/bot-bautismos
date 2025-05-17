/**
 * Rutas para acceder a los datos de Google Sheets
 */
const express = require('express');
const router = express.Router();
const sheetsService = require('../src/services/sheets-service');
const path = require('path');

// IDs de las hojas de cálculo
const SPREADSHEET_IDS = {
  hombres: '1B2x1HEjjPsQnkZZU1RZptALOs5mRwjD56KS7VHoDpJk',
  mujeres: '1kV8n07RE61-6fz7MIu5TSiYUjxPPTh5GVca0E1MCC7M'
};

// Ruta al archivo de credenciales
const CREDENTIALS_PATH = path.join(__dirname, '../config/google-credentials.json');

// Función auxiliar para obtener datos de una hoja de cálculo
async function getSheetDataHelper(spreadsheetId, sheetName, res) {
  try {
    // Inicializar el servicio con el archivo de credenciales
    const initialized = sheetsService.initializeWithCredentialsFile(CREDENTIALS_PATH);
    
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        error: 'No se pudo inicializar el servicio de Google Sheets'
      });
    }
    
    // Obtener todos los registros de la hoja especificada (columnas A-G)
    const range = `${sheetName}!A1:G1000`;
    const resultado = await sheetsService.getSheetData(spreadsheetId, range);
    
    // Extraer los datos agrupados por ciudad
    const { ciudades } = resultado;
    
    // Obtener información sobre las columnas presentes en los datos
    const columnInfo = {};
    const ciudadesDisponibles = Object.keys(ciudades);
    
    // Verificar si hay datos para obtener información de columnas
    if (ciudadesDisponibles.length > 0 && ciudades[ciudadesDisponibles[0]].length > 0) {
      const firstRow = ciudades[ciudadesDisponibles[0]][0];
      Object.keys(firstRow).forEach(key => {
        columnInfo[key] = {
          name: key,
          present: true
        };
      });
    }
    
    // Calcular el total de registros por ciudad
    const totalPorCiudad = {};
    let totalRegistros = 0;
    
    ciudadesDisponibles.forEach(ciudad => {
      const cantidadRegistros = ciudades[ciudad].length;
      totalPorCiudad[ciudad] = cantidadRegistros;
      totalRegistros += cantidadRegistros;
    });
    
    return { 
      success: true, 
      ciudades,
      totalRegistros,
      ciudadesDisponibles,
      totalPorCiudad,
      columnas: columnInfo,
      spreadsheetId,
      sheet: sheetName
    };
  } catch (error) {
    console.error('Error al obtener datos de la hoja de cálculo:', error);
    throw error;
  }
}

// Ruta para obtener datos de hombres
router.get('/hombres', async (req, res) => {
  try {
    const sheetName = req.query.sheet || 'Hoja1';
    const resultado = await getSheetDataHelper(SPREADSHEET_IDS.hombres, sheetName);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener datos de hombres',
      message: error.message
    });
  }
});

// Ruta para obtener datos de mujeres
router.get('/mujeres', async (req, res) => {
  try {
    const sheetName = req.query.sheet || 'Hoja1';
    const resultado = await getSheetDataHelper(SPREADSHEET_IDS.mujeres, sheetName);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener datos de mujeres',
      message: error.message
    });
  }
});

// Ruta para obtener todos los registros (mantener compatibilidad)
router.get('/data', async (req, res) => {
  try {
    const sheetName = req.query.sheet || 'Hoja1';
    const tipo = req.query.tipo || 'hombres';
    const spreadsheetId = SPREADSHEET_IDS[tipo] || SPREADSHEET_IDS.hombres;
    
    const resultado = await getSheetDataHelper(spreadsheetId, sheetName);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener datos de la hoja de cálculo',
      message: error.message
    });
  }
});

// Ruta para verificar la conexión con Google Sheets
router.get('/check-connection', async (req, res) => {
  try {
    // Inicializar el servicio con el archivo de credenciales
    const initialized = sheetsService.initializeWithCredentialsFile(CREDENTIALS_PATH);
    
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        error: 'No se pudo inicializar el servicio de Google Sheets'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Conexión con Google Sheets establecida correctamente',
      spreadsheetIds: SPREADSHEET_IDS
    });
  } catch (error) {
    console.error('Error al verificar la conexión con Google Sheets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al verificar la conexión con Google Sheets',
      message: error.message
    });
  }
});

// Ruta para actualizar un valor específico en la hoja de cálculo
router.post('/update', async (req, res) => {
  try {
    // Validar que se proporcionen todos los parámetros necesarios
    const { tipo, ciudad, nombrePersona, columna, valor, sheet } = req.body;
    
    if (!tipo || !ciudad || !nombrePersona || !columna || valor === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros incompletos',
        message: 'Debes proporcionar tipo, ciudad, nombrePersona, columna y valor'
      });
    }
    
    // Verificar que el tipo sea válido
    if (!SPREADSHEET_IDS[tipo]) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido',
        message: `El tipo debe ser uno de: ${Object.keys(SPREADSHEET_IDS).join(', ')}`
      });
    }
    
    // Inicializar el servicio con el archivo de credenciales
    const initialized = sheetsService.initializeWithCredentialsFile(CREDENTIALS_PATH);
    
    if (!initialized) {
      return res.status(500).json({ 
        success: false, 
        error: 'No se pudo inicializar el servicio de Google Sheets'
      });
    }
    
    // Obtener el ID de la hoja de cálculo según el tipo
    const spreadsheetId = SPREADSHEET_IDS[tipo];
    const sheetName = sheet || 'Hoja1';
    
    // Actualizar el valor en la hoja de cálculo
    const resultado = await sheetsService.updateSheetData(
      spreadsheetId,
      sheetName,
      ciudad.toUpperCase(), // Asegurar que la ciudad esté en mayúsculas
      nombrePersona,
      columna,
      valor
    );
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al actualizar datos en la hoja de cálculo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar datos en la hoja de cálculo',
      message: error.message
    });
  }
});

module.exports = router;
