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
- `clear`
- `abaddon` (easter egg)

## Personalizar acertijo

En `script.js` se pueden editar estas constantes:

- `RIDDLE_TEXT` para cambiar el enunciado
- `RIDDLE_ANSWERS` para cambiar respuestas válidas

## Despliegue

El repositorio incluye `.github/workflows/deploy-pages.yml` para desplegar automáticamente en **GitHub Pages** cuando hay cambios en la rama `main`.

También se puede ejecutar manualmente desde la pestaña **Actions** en GitHub.
