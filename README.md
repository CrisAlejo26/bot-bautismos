# Express App

Una aplicación web moderna construida con Express.js.

## Características

- Estructura de proyecto organizada
- Configuración de rutas API
- Manejo de errores
- Plantillas EJS para el frontend
- Diseño responsive para móviles, tablets y ordenadores
- Middleware CORS para peticiones cross-origin
- Logging con Morgan

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Copia el archivo `.env.example` a `.env` y configura las variables de entorno

## Desarrollo

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

## Producción

Para iniciar el servidor en modo producción:

```bash
npm start
```

## Estructura del Proyecto

```
express-app/
├── public/           # Archivos estáticos (CSS, JS, imágenes)
├── views/            # Plantillas EJS
├── routes/           # Definición de rutas
├── controllers/      # Controladores
├── models/           # Modelos de datos
├── middlewares/      # Middlewares personalizados
├── config/           # Archivos de configuración
├── app.js            # Configuración de Express
├── server.js         # Punto de entrada
└── package.json      # Dependencias y scripts
```

## Licencia

MIT
