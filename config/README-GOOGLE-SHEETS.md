# Configuración de Google Sheets API

Este documento explica cómo configurar las credenciales necesarias para acceder a la API de Google Sheets.

## Pasos para obtener credenciales de Google Cloud

1. **Crear un proyecto en Google Cloud Console**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Haz clic en "Seleccionar un proyecto" en la parte superior de la página
   - Haz clic en "Nuevo proyecto"
   - Ingresa un nombre para tu proyecto y haz clic en "Crear"

2. **Habilitar la API de Google Sheets**
   - En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API" y selecciónala
   - Haz clic en "Habilitar"

3. **Crear una cuenta de servicio**
   - En el menú lateral, ve a "APIs y servicios" > "Credenciales"
   - Haz clic en "Crear credenciales" y selecciona "Cuenta de servicio"
   - Ingresa un nombre para la cuenta de servicio, una descripción opcional y haz clic en "Crear"
   - En el paso "Otorgar a esta cuenta de servicio acceso al proyecto", selecciona el rol "Proyecto" > "Editor" (o un rol más restrictivo si lo prefieres)
   - Haz clic en "Continuar" y luego en "Listo"

4. **Crear una clave para la cuenta de servicio**
   - En la lista de cuentas de servicio, haz clic en la cuenta que acabas de crear
   - Ve a la pestaña "Claves"
   - Haz clic en "Agregar clave" > "Crear nueva clave"
   - Selecciona "JSON" y haz clic en "Crear"
   - Se descargará un archivo JSON con las credenciales

5. **Guardar el archivo de credenciales**
   - Renombra el archivo descargado a `google-credentials.json`
   - Guárdalo en la carpeta `config` de este proyecto

## Compartir la hoja de cálculo con la cuenta de servicio

1. **Obtener el email de la cuenta de servicio**
   - Abre el archivo `google-credentials.json`
   - Busca el campo `client_email` (algo como `nombre-cuenta@proyecto.iam.gserviceaccount.com`)

2. **Compartir la hoja de cálculo**
   - Abre tu hoja de cálculo en Google Sheets
   - Haz clic en el botón "Compartir" en la esquina superior derecha
   - Ingresa el email de la cuenta de servicio
   - Asegúrate de darle al menos permisos de "Lector"
   - Haz clic en "Enviar"

## Estructura del archivo de credenciales

El archivo `google-credentials.json` debe tener una estructura similar a esta:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "nombre-cuenta@proyecto.iam.gserviceaccount.com",
  "client_id": "123456...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/nombre-cuenta%40proyecto.iam.gserviceaccount.com"
}
```

## Uso de la API

Una vez configuradas las credenciales, puedes acceder a los datos de tu hoja de cálculo a través de las siguientes rutas:

- `GET /api/sheets/data`: Obtiene todos los registros de la hoja de cálculo
- `GET /api/sheets/data?sheet=NombreHoja`: Obtiene los registros de una hoja específica
- `GET /api/sheets/sheets`: Obtiene los nombres de todas las hojas disponibles

## Solución de problemas comunes

1. **Error "The caller does not have permission"**
   - Asegúrate de haber compartido la hoja de cálculo con la cuenta de servicio
   - Verifica que la cuenta de servicio tenga al menos permisos de "Lector"

2. **Error "API has not been used in project before"**
   - Asegúrate de haber habilitado la API de Google Sheets en tu proyecto

3. **Error "Invalid value for spreadsheetId"**
   - Verifica que el ID de la hoja de cálculo sea correcto
   - El ID se encuentra en la URL de la hoja de cálculo: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
