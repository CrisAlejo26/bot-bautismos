/**
 * Ejemplo de uso del servicio de Google Sheets
 * Este archivo muestra cómo utilizar el servicio para obtener datos de una hoja de cálculo
 */
const sheetsService = require('./sheets-service');
require('dotenv').config();
const path = require('path');

// ID de la hoja de cálculo (extraído de la URL)
// URL: https://docs.google.com/spreadsheets/d/1a9CODsX0nsxQcf56P22FR2MJviJBfVFH/edit?usp=drive_web&ouid=104929771261324882752&rtpof=true
const SPREADSHEET_ID = '1B2x1HEjjPsQnkZZU1RZptALOs5mRwjD56KS7VHoDpJk';

// Ruta al archivo de credenciales (debe estar en una ubicación segura)
const CREDENTIALS_PATH = path.join(__dirname, '../../config/google-credentials.json');

/**
 * Función principal que muestra cómo obtener datos de la hoja de cálculo
 */
async function main() {
  try {
    // Inicializar el servicio con el archivo de credenciales
    const initialized = sheetsService.initializeWithCredentialsFile(CREDENTIALS_PATH);
    
    if (!initialized) {
      console.error('No se pudo inicializar el servicio de Google Sheets');
      return;
    }
    
    console.log('Servicio de Google Sheets inicializado correctamente');
    
    // Obtener los nombres de todas las hojas en el libro
    const sheetNames = await sheetsService.getSheetNames(SPREADSHEET_ID);
    console.log('Hojas disponibles:', sheetNames);
    
    // Nombre de la primera hoja (ajustar según la estructura de tu hoja de cálculo)
    const sheetName = sheetNames[0];
    
    // Obtener todos los registros de la primera hoja
    // El rango 'A1:Z1000' es un ejemplo, ajústalo según tus necesidades
    const range = `${sheetName}!A1:Z1000`;
    const data = await sheetsService.getSheetData(SPREADSHEET_ID, range);
    
    console.log(`Se encontraron ${data.length} registros en la hoja "${sheetName}"`);
    
    // Mostrar los primeros 5 registros (o menos si hay menos de 5)
    const sampleSize = Math.min(5, data.length);
    console.log(`Mostrando ${sampleSize} registros de ejemplo:`);
    
    for (let i = 0; i < sampleSize; i++) {
      console.log(`Registro #${i + 1}:`, data[i]);
    }
    
    // Devolver todos los datos para su uso en otras partes de la aplicación
    return data;
    
  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error);
  }
}

// Ejecutar la función principal si este archivo se ejecuta directamente
if (require.main === module) {
  main().catch(console.error);
}

// Exportar la función para su uso en otras partes de la aplicación
module.exports = {
  getAllSheetData: main,
  getSheetService: () => sheetsService,
  SPREADSHEET_ID
};
