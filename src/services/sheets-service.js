/**
 * Servicio para interactuar con la API de Google Sheets
 * Este servicio permite obtener datos de una hoja de cálculo de Google Sheets
 */
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

/**
 * Clase que proporciona métodos para interactuar con Google Sheets
 */
class SheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Inicializa el cliente de la API de Google Sheets
   * @param {Object} credentials - Credenciales de la cuenta de servicio
   * @returns {Boolean} - True si la inicialización fue exitosa
   */
  initialize(credentials) {
    try {
      // Crear un cliente JWT con las credenciales
      // Nota: Cambiamos el scope para permitir escritura
      const auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ["https://www.googleapis.com/auth/spreadsheets"]
      );

      // Crear el cliente de Sheets
      this.sheets = google.sheets({ version: "v4", auth });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error(
        "Error al inicializar el servicio de Google Sheets:",
        error
      );
      return false;
    }
  }

  /**
   * Inicializa el servicio con credenciales desde un archivo
   * @param {String} credentialsPath - Ruta al archivo de credenciales JSON
   * @returns {Boolean} - True si la inicialización fue exitosa
   */
  initializeWithCredentialsFile(credentialsPath) {
    try {
      const credentialsContent = fs.readFileSync(credentialsPath, "utf8");
      const credentials = JSON.parse(credentialsContent);
      return this.initialize(credentials);
    } catch (error) {
      console.error("Error al leer el archivo de credenciales:", error);
      return false;
    }
  }

  /**
   * Obtiene todos los registros de una hoja de cálculo
   * @param {String} spreadsheetId - ID de la hoja de cálculo
   * @param {String} range - Rango de celdas (ej. 'Hoja1!A1:G1000')
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los datos agrupados por ciudad
   */
  async getSheetData(spreadsheetId, range) {
    if (!this.initialized) {
      throw new Error("El servicio de Google Sheets no ha sido inicializado");
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        console.log("No se encontraron datos en la hoja de cálculo.");
        return { ciudades: {} };
      }

      // Definir encabezados fijos para las columnas A-G
      const fixedHeaders = [
        "CREYENTES", // Columna A - Nombre correcto para la primera columna
        "HOMBRES", // Columna B
        "MANILLA", // Columna C
        "MENORES DE EDAD Y ACOMPAÑANTES", // Columna D
        "MANILLA_2", // Columna E
        "PERSONAS CON DISCAPACIDAD REDUCIDA Y ACOMPAÑANTE", // Columna F
        "MANILLA_3", // Columna G
      ];

      // Asegurarse de que tenemos encabezados para todas las columnas A-G
      const expectedColumns = ["A", "B", "C", "D", "E", "F", "G"];
      const normalizedHeaders = [];

      // Usar los encabezados fijos para evitar problemas con la primera fila
      for (let i = 0; i < expectedColumns.length; i++) {
        if (i < fixedHeaders.length) {
          normalizedHeaders[i] = fixedHeaders[i];
        } else {
          normalizedHeaders[i] = `Columna${expectedColumns[i]}`;
        }
      }

      // Lista de ciudades conocidas
      const ciudadesConocidas = [
        "CARTAGENA",
        "MURCIA",
        "CASTELLÓN",
        "ELCHE",
        "TORREVIEJA",
        "BENIDORM",
      ];

      // Objeto para almacenar los datos agrupados por ciudad
      const datosPorCiudad = {};

      // Inicializar CARTAGENA como ciudad por defecto para los primeros registros
      let ciudadActual = "CARTAGENA";
      datosPorCiudad[ciudadActual] = [];

      // Procesar las filas
      rows.slice(1).forEach((row) => {
        if (row.length === 0) return; // Ignorar filas vacías

        const firstCell = row[0] ? row[0].trim().toUpperCase() : "";

        // Verificar si la primera celda contiene el nombre de una ciudad
        if (ciudadesConocidas.includes(firstCell)) {
          ciudadActual = firstCell;
          // Inicializar el array para esta ciudad si no existe
          if (!datosPorCiudad[ciudadActual]) {
            datosPorCiudad[ciudadActual] = [];
          }
          return; // Pasar a la siguiente fila
        }

        const item = {};

        // Asegurarse de que cada fila tenga valores para todas las columnas A-G
        for (let i = 0; i < normalizedHeaders.length; i++) {
          // Obtener el nombre de la columna del encabezado normalizado
          const columnName = normalizedHeaders[i];
          // Si el valor existe en la fila, usarlo; de lo contrario, usar cadena vacía
          item[columnName] = i < row.length ? row[i] : "";
        }

        // Añadir el item al array de la ciudad actual
        datosPorCiudad[ciudadActual].push(item);
      });

      return {
        ciudades: datosPorCiudad,
      };
    } catch (error) {
      console.error("Error al obtener datos de la hoja de cálculo:", error);
      throw error;
    }
  }

  /**
   * Actualiza un valor específico en la hoja de cálculo
   * @param {String} spreadsheetId - ID de la hoja de cálculo
   * @param {String} sheetName - Nombre de la hoja
   * @param {String} ciudad - Nombre de la ciudad
   * @param {String} nombrePersona - Nombre de la persona a actualizar
   * @param {String} columnaActualizar - Nombre de la columna a actualizar
   * @param {String} nuevoValor - Nuevo valor a establecer
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con el resultado de la operación
   */
  async updateSheetData(
    spreadsheetId,
    sheetName,
    ciudad,
    nombrePersona,
    columnaActualizar,
    nuevoValor
  ) {
    if (!this.initialized) {
      throw new Error("El servicio de Google Sheets no ha sido inicializado");
    }

    try {
      // Primero, obtener todos los datos para encontrar la fila exacta a actualizar
      const range = `${sheetName}!A1:G1000`;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        throw new Error("No se encontraron datos en la hoja de cálculo.");
      }

      // Definir encabezados fijos como en getSheetData
      const fixedHeaders = [
        "CREYENTES",
        "HOMBRES",
        "MANILLA",
        "MENORES DE EDAD Y ACOMPAÑANTES",
        "MANILLA_2",
        "PERSONAS CON DISCAPACIDAD REDUCIDA Y ACOMPAÑANTE",
        "MANILLA_3",
      ];

      // Encontrar el índice de la columna a actualizar
      const columnIndex = fixedHeaders.indexOf(columnaActualizar);
      if (columnIndex === -1) {
        throw new Error(`Columna "${columnaActualizar}" no encontrada.`);
      }

      // Variables para rastrear la búsqueda
      let ciudadActual = null;
      let filaEncontrada = -1;

      // Registrar información de depuración
      console.log(`Buscando a "${nombrePersona}" en la ciudad "${ciudad}"`);
      console.log(`Total de filas en la hoja: ${rows.length}`);

      // Inicializar CARTAGENA como ciudad por defecto para los primeros registros
      ciudadActual = "CARTAGENA";

      // Buscar la fila que corresponde a la ciudad y persona
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0] ? row[0].trim().toUpperCase() : "";
        const ciudadesConocidas = [
          "CARTAGENA",
          "MURCIA",
          "CASTELLÓN",
          "ELCHE",
          "TORREVIEJA",
          "BENIDORM",
        ];

        // Verificar si es una fila de ciudad
        if (ciudadesConocidas.includes(firstCell)) {
          ciudadActual = firstCell;
          console.log(`Fila ${i + 1}: Cambio a ciudad ${ciudadActual}`);
          continue;
        }

        // Si estamos en la ciudad correcta
        if (ciudadActual === ciudad && row.length > 1) {
          const nombreColumnIndexMap = {
            MANILLA: 1,
            MANILLA_2: 3,
            MANILLA_3: 5,
          };

          const nombreColIndex = nombreColumnIndexMap[columnaActualizar];

          // Si no se encuentra el índice correcto
          if (nombreColIndex === undefined) {
            throw new Error(
              `No se pudo determinar la columna del nombre para la columna "${columnaActualizar}"`
            );
          }

          const nombreEnFila = row[nombreColIndex]
            ? row[nombreColIndex].trim()
            : "";

          // Registrar para depuración
          console.log(
            `Fila ${
              i + 1
            } en ${ciudadActual}: Comparando "${nombreEnFila}" con "${nombrePersona}"`
          );

          // Comparación más flexible: ignorar espacios adicionales y comparar sin distinguir mayúsculas/minúsculas
          const nombreNormalizado = nombreEnFila
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
          const nombreBuscadoNormalizado = nombrePersona
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

          if (nombreNormalizado === nombreBuscadoNormalizado) {
            filaEncontrada = i;
            console.log(`¡Coincidencia encontrada en la fila ${i + 1}!`);
            break;
          }
        }
      }

      if (filaEncontrada === -1) {
        // Si no se encontró, mostrar los nombres disponibles en esa ciudad para ayudar a depurar
        console.log(
          `No se encontró a "${nombrePersona}" en la ciudad "${ciudad}". Nombres disponibles:`
        );

        ciudadActual = null;
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const firstCell = row[0] ? row[0].trim().toUpperCase() : "";
          const ciudadesConocidas = [
            "CARTAGENA",
            "MURCIA",
            "CASTELLÓN",
            "ELCHE",
            "TORREVIEJA",
            "BENIDORM",
          ];

          if (ciudadesConocidas.includes(firstCell)) {
            ciudadActual = firstCell;
            continue;
          }

          if (ciudadActual === ciudad && row.length > 1) {
            console.log(`- "${row[1]}"`);
          }
        }

        throw new Error(
          `No se encontró a "${nombrePersona}" en la ciudad "${ciudad}". Verifica el nombre exacto.`
        );
      }

      // Construir el rango para la celda específica a actualizar
      // Convertir índice numérico a letra de columna (A, B, C, etc.)
      const columnLetter = String.fromCharCode(65 + columnIndex); // A = 65 en ASCII
      const updateRange = `${sheetName}!${columnLetter}${filaEncontrada + 1}`; // +1 porque las filas en Sheets empiezan en 1

      // Determinar si el valor es numérico
      let valorProcesado = nuevoValor;
      if (!isNaN(nuevoValor) && nuevoValor !== "") {
        // Si es numérico, convertirlo a número
        valorProcesado = Number(nuevoValor);
      }

      // Realizar la actualización
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        // Usar USER_ENTERED para que Google Sheets interprete el formato correctamente
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[valorProcesado]],
        },
      });

      return {
        success: true,
        message: `Valor actualizado correctamente para ${nombrePersona} en ${ciudad}, columna ${columnaActualizar}.`,
        updatedCell: updateRange,
        newValue: nuevoValor,
      };
    } catch (error) {
      console.error("Error al actualizar datos en la hoja de cálculo:", error);
      throw error;
    }
  }

  /**
   * Obtiene metadatos de una hoja de cálculo
   * @param {String} spreadsheetId - ID de la hoja de cálculo
   * @returns {Promise<Object>} - Promesa que resuelve a un objeto con los metadatos
   */
  async getSpreadsheetMetadata(spreadsheetId) {
    if (!this.initialized) {
      throw new Error("El servicio de Google Sheets no ha sido inicializado");
    }

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return response.data;
    } catch (error) {
      console.error("Error al obtener metadatos de la hoja de cálculo:", error);
      throw error;
    }
  }

  /**
   * Obtiene los nombres de todas las hojas en un libro de Google Sheets
   * @param {String} spreadsheetId - ID de la hoja de cálculo
   * @returns {Promise<Array<String>>} - Promesa que resuelve a un array con los nombres de las hojas
   */
  async getSheetNames(spreadsheetId) {
    const metadata = await this.getSpreadsheetMetadata(spreadsheetId);
    return metadata.sheets.map((sheet) => sheet.properties.title);
  }
}

// Exportar una instancia única del servicio
const sheetsService = new SheetsService();
module.exports = sheetsService;
