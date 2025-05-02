const fs = require("fs");
const path = require("path");

// Ruta al archivo de logs
const logsFilePath = path.join(__dirname, "../../data/visitor-logs.json");

/**
 * Lee los logs de visitantes del archivo JSON
 * @returns {Array} Array de logs de visitantes
 */
function readVisitorLogs() {
  try {
    // Verificar si el archivo existe
    if (fs.existsSync(logsFilePath)) {
      const logsData = fs.readFileSync(logsFilePath, "utf8");
      const data = JSON.parse(logsData);
      return data.logs || [];
    } else {
      // Si el archivo no existe, crear uno nuevo con un array vacío
      const initialData = { logs: [] };
      fs.writeFileSync(
        logsFilePath,
        JSON.stringify(initialData, null, 2),
        "utf8"
      );
      return [];
    }
  } catch (error) {
    console.error("Error al leer los logs de visitantes:", error);
    return [];
  }
}

/**
 * Guarda los logs de visitantes en el archivo JSON
 * @param {Array} logs Array de logs de visitantes
 * @returns {boolean} true si se guardó correctamente, false en caso contrario
 */
function writeVisitorLogs(logs) {
  try {
    // Asegurarse de que el directorio existe
    const dirPath = path.dirname(logsFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Escribir el archivo
    fs.writeFileSync(logsFilePath, JSON.stringify({ logs }, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error al escribir los logs de visitantes:", error);
    return false;
  }
}

/**
 * Agrega un nuevo log de visitante
 * @param {Object} logData Datos del log de visitante
 * @returns {boolean} true si se agregó correctamente, false en caso contrario
 */
function addVisitorLog(logData) {
  try {
    // Leer logs actuales
    const logs = readVisitorLogs();

    // Agregar timestamp del servidor
    logData.serverTimestamp = new Date().toISOString();

    // Agregar el nuevo log al principio del array para mostrar los más recientes primero
    logs.unshift(logData);

    // Guardar los logs actualizados
    return writeVisitorLogs(logs);
  } catch (error) {
    console.error("Error al agregar log de visitante:", error);
    return false;
  }
}

/**
 * Obtiene todos los logs de visitantes
 * @returns {Array} Array de logs de visitantes
 */
function getAllVisitorLogs() {
  return readVisitorLogs();
}

module.exports = {
  addVisitorLog,
  getAllVisitorLogs,
};
