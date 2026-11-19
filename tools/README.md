# tools/ — generador de la presentación (copia vendorizada)

Esta carpeta es una **copia** del generador de presentaciones del repo de marca,
traída a `sostenitek` para que la presentación docente se pueda **regenerar desde
este repo solo**: sin clonar `praxilab-brand` al lado y sin red.

## Qué hay

```
presentacion-html.mjs                     El generador (solo usa Node, sin npm).
sistema-de-diseno/fuentes/                Tipografías (Archivo, Instrument Sans,
                                          Courier Prime) en woff2 + fuentes.css,
                                          con sus licencias OFL. Se incrustan en
                                          base64 en el HTML generado.
sistema-de-diseno/assets/Logos/           El logotipo que va en las portadas.
```

El generador lee `deck.json` y `slides/` de la carpeta que se le pasa, y busca las
tipografías y el logotipo en `sistema-de-diseno/` **junto a sí mismo**. Por eso esa
subestructura se conserva tal cual.

## Regenerar

Desde la raíz del repo:

```
node docs/presentacion-docentes/tools/presentacion-html.mjs docs/presentacion-docentes
```

Escribe `docs/presentacion-docentes/presentacion.html`. No toca nada más.

## Procedencia y re-sincronización

- **Origen:** `https://github.com/praxilab/praxilab-brand`
- **Commit:** `bcf6e39d240296df89d15af0383ea5374a467e7e` (2026-10-05)
- **Archivos:** `presentacion-html.mjs`, `sistema-de-diseno/fuentes/`,
  `sistema-de-diseno/assets/Logos/praxilab_horizontal_negativo.svg`.

`presentacion-html.mjs` se copió **sin modificar**. Si el generador de la marca
cambia y quieres la mejora aquí, vuelve a copiar esos mismos archivos desde
`praxilab-brand` y actualiza el commit de arriba. No lo edites a mano: así la
re-sincronización es una copia limpia.

La fuente de verdad del sistema de diseño sigue siendo `praxilab-brand`; esto es
solo lo justo para construir esta presentación offline.
