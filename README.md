# sacrificioPage

Terminal web temática ocultista lista para publicarse con **GitHub Pages**.

## Estructura

```text
/
├── index.html
├── style.css
├── script.js
└── .github/workflows/deploy-pages.yml
```

## Desarrollo local

Este proyecto es un sitio estático y no requiere build ni dependencias externas.

Para probarlo localmente, abre `index.html` en tu navegador.

## Comandos disponibles

- `help`
- `start`
- `restart`
- `clear`
- `sound on`
- `sound off`
- `abaddon` (easter egg)
- `rdj` (easter egg narrativo con audio por voz del navegador)

## Personalizar acertijos

En `script.js` se pueden editar estas constantes:

- `RIDDLES` para cambiar enunciados y respuestas válidas de cada acertijo
- `SOUND_ENABLED` para activar/desactivar toda la capa de sonido 

## Despliegue

El repositorio incluye `.github/workflows/deploy-pages.yml` para desplegar automáticamente en **GitHub Pages** cuando hay cambios en la rama `main`.

También se puede ejecutar manualmente desde la pestaña **Actions** en GitHub.
