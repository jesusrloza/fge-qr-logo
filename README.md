# Generador de Códigos QR - Fiscalía General del Estado de Michoacán

Este proyecto está diseñado para ayudar a los equipos a producir códigos QR consistentes y compatibles con la marca para carteles, oficios y otros documentos de la Fiscalía General del Estado de Michoacán (Fiscalía General del Estado de Michoacán).

## Requisitos

- **Node.js**: Versión 22 o superior
- **npm**: Incluido con Node.js

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/jesusrloza/fge-qr-logo.git
   cd fge-qr-logo
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

### Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo de Vite. Abre tu navegador y ve a `http://localhost:5173` (o el puerto que indique la consola).

## Cómo Generar Códigos QR

1. **Ingresa la URL**: En el campo "URL", escribe la dirección web que deseas codificar en el código QR.

2. **Selecciona el Formato**: Elige el formato de descarga deseado (PNG, JPEG o WEBP) del menú desplegable.

3. **Genera el Código QR**: El código QR se genera automáticamente a medida que escribes la URL.

4. **Descarga el Código QR**: Haz clic en el botón "Descargar QR" para guardar el código QR en tu dispositivo con el formato seleccionado.

## Características

- **Diseño Institucional**: Utiliza los colores oficiales de la Fiscalía General del Estado de Michoacán (#152f4a azul oscuro y #c09f77 dorado).
- **Logo Integrado**: Incluye el logo de la institución en el código QR.
- **Interfaz Intuitiva**: Diseño minimalista y fácil de usar con instrucciones claras.
- **Formatos Múltiples**: Soporte para descarga en PNG, JPEG y WEBP.
- **Responsive**: Funciona en dispositivos móviles y de escritorio.

## Tecnologías Utilizadas

- **React**: Biblioteca para la interfaz de usuario
- **TypeScript**: Para tipado estático
- **Vite**: Herramienta de construcción rápida
- **qr-code-styling**: Librería para generar códigos QR personalizados

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run lint`: Ejecuta ESLint para verificar el código
- `npm run preview`: Previsualiza la construcción de producción
- `npm run format`: Formatea el código con Prettier

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es propiedad de la Fiscalía General del Estado de Michoacán.
