# sacrificioPage

Terminal web temática ocultista lista para GitHub Pages.

## Estructura

```text
/
├── index.html
├── style.css
└── script.js
```

## Uso local

Abrir `index.html` en tu navegador.

Comandos disponibles:

- `help`
- `start`
- `clear`
- `abaddon` (easter egg)

## Personalizar acertijo

En `script.js` editar estas constantes:

- `RIDDLE_TEXT` para cambiar el enunciado
- `RIDDLE_ANSWERS` para cambiar respuestas válidas

## Deploy en GitHub Pages

1. Subí los cambios a tu rama principal (`main`) o la que uses para Pages.
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment**, elegí:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (o tu rama) y carpeta `/ (root)`
4. Guardá y esperá la URL pública que muestra GitHub Pages.
