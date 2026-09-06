# GANOVAL — landing

Sitio estático. Sin npm, sin build. Se sube tal cual.

## Estructura

```
index.html      ← toda la página
styles.css      ← estilos
script.js       ← carrusel, quiz, cotizador, FAQ
img/            ← 6 fotos de trabajos + logo (WebP)
```

## Subir a GitHub y Vercel

1. En GitHub: **New repository** → nombre `ganoval` → Public → Create.
2. En el repo vacío: **uploading an existing file** → arrastra `index.html`, `styles.css`,
   `script.js` y la carpeta `img` completa → Commit.
3. En Vercel: **Add New → Project** → importa el repo `ganoval`.
4. Framework Preset: **Other**. Root Directory: `./`. Build Command: vacío. Output: vacío.
5. Deploy.

Cada vez que edites un archivo en GitHub, Vercel redespliega solo.

## Después de cada cambio en CSS o JS

Sube el número de versión en las dos líneas de `index.html`:

```html
<link rel="stylesheet" href="styles.css?v=20260906">
<script defer src="script.js?v=20260906"></script>
```

Cambia `20260906` por la fecha del día. Así nadie ve la versión vieja en caché.

## Qué cambiar cuando quieras

| Qué | Dónde |
|---|---|
| Número de WhatsApp | `script.js` línea `var WA = "593991763133";` **y** los 4 enlaces `wa.me/...` en `index.html` |
| Textos de las preguntas frecuentes | `index.html`, sección `<!-- PREGUNTAS -->` |
| Preguntas del quiz | `script.js`, arreglo `preguntas` |
| Productos del cotizador | `index.html`, los bloques `<button class="ficha">` |

## Fotos nuevas

Guárdalas en `img/` en formato `.webp` (o `.jpg`) y añade otro bloque `<figure class="obra">`
dentro de `#carril-obras`, copiando uno de los que ya están. El atributo `data-tipo`
debe ser `residencial` o `comercial` para que el filtro la tome.

## Revisar antes de publicar

- [ ] Los textos de las preguntas 4 (plazos), 5 (instalación incluida) y 7 (LED aparte)
      son borradores razonables. **Confirma que reflejan cómo trabajas** antes de publicar.
- [ ] Prueba el botón de WhatsApp desde el celular, no solo desde la computadora.
- [ ] Si el logo se ve pixelado en pantallas grandes, sube una versión de 1200px a `img/logo.webp`.
