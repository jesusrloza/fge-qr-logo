# Cómo Deshabilitar GitHub Pages

Este documento explica cómo deshabilitar completamente GitHub Pages para este repositorio y detener las notificaciones de fallos de despliegue.

## Problema

GitHub Pages fue configurado previamente en este repositorio, creando un workflow automático llamado `pages-build-deployment` que se ejecuta cada vez que se hace push a la rama `main`. Como la configuración no está completa o no es funcional, cada ejecución falla y envía notificaciones por correo electrónico.

## Solución

Para deshabilitar completamente GitHub Pages y detener las notificaciones de fallos, sigue estos pasos:

### Opción 1: Mediante la Interfaz Web de GitHub (Recomendado)

1. **Ve a la configuración del repositorio:**
   - Abre el repositorio en GitHub: https://github.com/jesusrloza/fge-qr-logo
   - Haz clic en la pestaña **"Settings"** (Configuración)

2. **Accede a la sección Pages:**
   - En el menú lateral izquierdo, busca y haz clic en **"Pages"** (está en la sección "Code and automation")

3. **Deshabilita GitHub Pages:**
   - En la sección **"Source"** (Fuente), verás un menú desplegable
   - Selecciona **"None"** (Ninguno) en el menú desplegable
   - Haz clic en **"Save"** (Guardar)

4. **Verifica:**
   - Después de guardar, deberías ver un mensaje indicando que GitHub Pages está deshabilitado
   - El workflow `pages-build-deployment` dejará de ejecutarse automáticamente

### Opción 2: Mediante la CLI de GitHub (gh)

Si tienes instalada la CLI de GitHub, puedes deshabilitar Pages con este comando:

```bash
# Deshabilitar GitHub Pages
gh api repos/jesusrloza/fge-qr-logo/pages -X DELETE
```

**Nota:** Este comando requiere que tengas permisos de administrador en el repositorio.

## Verificación

Para verificar que GitHub Pages ha sido deshabilitado correctamente:

1. **Revisa la sección Actions:**
   - Ve a la pestaña **"Actions"** en el repositorio
   - No deberías ver nuevas ejecuciones del workflow `pages-build-deployment` después de hacer push a `main`

2. **Revisa tu correo electrónico:**
   - Después de hacer push a `main`, no deberías recibir más notificaciones de fallos de despliegue

## Workflows Existentes

Este repositorio no tiene archivos de workflow personalizados en `.github/workflows/`. El único workflow presente es el automático de GitHub Pages que se crea cuando Pages está habilitado. Una vez deshabilitado, este workflow dejará de ejecutarse.

## Información Adicional

- **Workflow automático:** `pages-build-deployment` es un workflow "dinámico" gestionado por GitHub, no un archivo en el repositorio
- **Sin archivos de configuración:** No hay archivos de configuración de Jekyll o Pages en el repositorio (como `_config.yml`, `.nojekyll`, `CNAME`)
- **Despliegue alternativo:** Este proyecto está configurado para ejecutarse con Docker/Vite, no necesita GitHub Pages

## Soporte

Si después de seguir estos pasos sigues recibiendo notificaciones de fallos:

1. Verifica que hayas guardado los cambios en la configuración de Pages
2. Espera unos minutos para que los cambios se propaguen
3. Revisa que no haya otros workflows activos en la sección Actions
4. Contacta con el soporte de GitHub si el problema persiste

---

**Fecha de creación:** 2025-11-12  
**Última actualización:** 2025-11-12
