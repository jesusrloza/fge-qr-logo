# Generador de Códigos QR - Fiscalía General del Estado de Michoacán

Este proyecto está diseñado para ayudar a los equipos a producir códigos QR consistentes y compatibles con la marca para carteles, oficios y otros documentos de la Fiscalía General del Estado de Michoacán (Fiscalía General del Estado de Michoacán).

## Requisitos

### Opción 1: Docker (Recomendado)

- **Docker**: Versión 20.x o superior
- **Docker Compose**: Versión 2.x o superior
- **Make**: Para usar los comandos del Makefile

### Opción 2: Desarrollo Local

- **Node.js**: Versión 22 o superior
- **npm**: Incluido con Node.js

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/jesusrloza/fge-qr-logo.git
   cd fge-qr-logo
   ```

2. Copia el archivo de configuración:

   ```bash
   cp .env.example .env
   ```

3. Configura las variables de entorno en `.env` (ver sección de Configuración)

4. Instala las dependencias (solo si usas desarrollo local):
   ```bash
   npm install
   ```

## Uso

### Usando Docker (Producción)

Para ejecutar la aplicación en un contenedor Docker:

```bash
# Iniciar el contenedor
make start

# La aplicación estará disponible en http://localhost:4173
```

Otros comandos disponibles:

```bash
make stop      # Detener el contenedor
make restart   # Reiniciar el contenedor
make logs      # Ver logs del contenedor
make clean     # Limpiar contenedores e imágenes
make dev       # Iniciar servidor de desarrollo
make test      # Ejecutar pruebas
```

### Desarrollo Local

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite con el backend Express integrado. Abre tu navegador y ve a `http://localhost:5173` (o el puerto que indique la consola).

## Arquitectura

La aplicación consta de:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js (integrado vía middleware en desarrollo, standalone en producción)

### Flujo de Usuario

1. **Identificación**: Al primer uso, se solicita el CURP del usuario (opcional pero recomendado)
2. **Ingreso de URL**: El usuario ingresa la URL a codificar
3. **Acortamiento**: Opcionalmente, la URL se acorta usando TinyURL o Bit.ly
4. **Generación**: El código QR se genera con el branding institucional
5. **Descarga**: El usuario descarga el QR en su formato preferido

### Sistema de Caché

El servidor mantiene un caché de URLs acortadas para:

- **Evitar llamadas duplicadas** a APIs de terceros
- **Compartir caché entre usuarios** (una URL acortada beneficia a todos)
- **Persistencia**: Almacenado en `data/url-cache.json`
- **TTL**: 30 días por entrada
- **Límite**: 500 entradas con evicción LRU

### Sistema de Logs

Los logs se almacenan en archivos trimestrales para auditoría:

- **Formato**: `logs/YYYY-QX.log` (ej: `2025-Q2.log`)
- **Retención**: 1 año (archivos más antiguos se eliminan automáticamente)
- **Contenido**: Timestamps, niveles, contexto y mensajes estructurados

**Ejemplo de log:**

```
[2025-04-15T10:30:45.123Z] [INFO] [Auth] User verified: GARC850101HDFRRL09
[2025-04-15T10:31:05.789Z] [INFO] [Shortener] URL shortened: https://example.com -> https://tinyurl.com/abc123
```

**Buscar en logs:**

```bash
# En Docker
docker exec fge-qr-logo grep "GARC850101" /app/logs/*.log

# Local
grep "ERROR" logs/2025-Q2.log
```

## Cómo Generar Códigos QR

1. **Identificación (opcional)**: Ingresa tu CURP para trazabilidad, o continúa sin identificarte.

2. **Ingresa la URL**: En el campo "URL", escribe la dirección web que deseas codificar en el código QR.

3. **Acorta la URL (opcional)**: Activa el switch para acortar URLs largas usando TinyURL o Bit.ly.

4. **Genera el Código QR**: El código QR se genera automáticamente a medida que escribes la URL.

5. **Selecciona el Formato**: Elige el formato de descarga deseado (PNG, JPEG o WEBP).

6. **Descarga el Código QR**: Haz clic en el botón "Descargar QR" para guardar el código QR.

## Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Token de acceso para Bit.ly (opcional)
VITE_BITLY_ACCESS_TOKEN=tu_token_aqui

# Secreto para firmar tokens JWT (REQUERIDO en producción)
JWT_SECRET=un-secreto-seguro-de-al-menos-32-caracteres

# Puerto del servidor (opcional, default 4173 en dev, 3000 en Docker)
PORT=4173
```

### Acortamiento de URLs

La aplicación soporta dos servicios de acortamiento:

- **TinyURL**: No requiere autenticación. Usa `https://tinyurl.com/api-create.php?url=...`
- **Bit.ly**: Requiere token. Usa `https://api-ssl.bitly.com/v4/shorten`

Para usar Bit.ly, obtén un token en [bitly.com](https://bitly.com) y configúralo en `.env`.

El sistema muestra una advertencia si la URL ya es muy corta (menos de 30 caracteres).

## Características

- **Diseño Institucional**: Utiliza los colores oficiales de la Fiscalía General del Estado de Michoacán (#152f4a azul oscuro y #c09f77 dorado).
- **Logo Integrado**: Incluye el logo de la institución en el código QR.
- **Identificación de Usuario**: Sistema opcional de CURP con JWT para trazabilidad.
- **Caché Compartido**: Las URLs acortadas se cachean en el servidor para todos los usuarios.
- **Auditoría**: Logs trimestrales con retención de 1 año.
- **Interfaz Intuitiva**: Diseño minimalista con flujo de 3 pasos claro.
- **Manejo de Errores**: Reintentos automáticos y mensajes amigables.
- **Formatos Múltiples**: Soporte para descarga en PNG, JPEG y WEBP.
- **Responsive**: Funciona en dispositivos móviles y de escritorio.

## Tecnologías Utilizadas

- **React 18**: Biblioteca para la interfaz de usuario
- **TypeScript**: Para tipado estático
- **Vite**: Herramienta de construcción rápida
- **Express**: Servidor backend
- **qr-code-styling**: Librería para generar códigos QR personalizados
- **jsonwebtoken**: Para autenticación JWT
- **Vitest**: Framework de testing

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo (frontend + backend)
- `npm run build`: Construye el frontend para producción
- `npm run build:server`: Construye el servidor para producción
- `npm run start`: Inicia el servidor de producción
- `npm run test`: Ejecuta las pruebas
- `npm run test:ui`: Ejecuta las pruebas con interfaz visual
- `npm run test:coverage`: Ejecuta las pruebas con reporte de cobertura
- `npm run lint`: Ejecuta ESLint para verificar el código
- `npm run preview`: Previsualiza la construcción de producción
- `npm run format`: Formatea el código con Prettier

## Estructura del Proyecto

```
├── src/                  # Código fuente del frontend
│   ├── components/       # Componentes React
│   ├── services/         # Servicios (API, auth)
│   ├── hooks/            # Custom hooks
│   ├── constants/        # Constantes
│   └── types/            # Definiciones TypeScript
├── server/               # Código fuente del backend
│   ├── routes/           # Rutas de API
│   └── services/         # Servicios (cache, logger, shorteners)
├── docker/               # Configuración Docker
├── data/                 # Datos persistentes (caché)
├── logs/                 # Logs de auditoría
└── public/               # Assets estáticos
```

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es propiedad de la Fiscalía General del Estado de Michoacán.
