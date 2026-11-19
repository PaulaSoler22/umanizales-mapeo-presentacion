# Mapeo curricular · UManizales · Contaduría Pública

Presentación de 11 láminas para la dirección del programa de Contaduría Pública (virtual) de la Universidad de Manizales: qué
asignaturas del plan de estudios (Contaduría Pública virtual, SNIES 1034) pueden trabajarse con un simulador PraxiLab, con
cuál y en qué periodo.

- **4 asignaturas con simulador**: 2 de aplicación directa y 2 como apoyo al curso, entre el 5.º y el 8.º periodo.
- **5 simuladores**: AudiTek, RentaSim, TerriTek, ProcediTek y SosteniTek ESG.

## Cómo verla

- **Sin cuenta ni conexión:** `presentacion.html` es la presentación completa en un solo archivo (tipografías y logotipo incrustados). Se abre con doble clic en cualquier navegador: flechas o clic para avanzar, `N` notas del presentador, `F` pantalla completa.
- **PDF:** `node generar.js --pdf`, o Imprimir → Guardar como PDF desde el navegador.
- **De dónde sale cada dato:** el Excel del mapeo (cifras y asignaturas) y la guía docente de cada simulador (formato, horas y entregables).

## Qué hay aquí

```
mapeo.js             Los datos del mapeo de esta universidad. Es lo que se edita.
catalogo.js          Los datos de cada simulador, tomados de su guía docente.
generar.js           Genera deck.json, slides/ y presentacion.html a partir de los dos anteriores.
deck.json            GENERADO. Índice: título, orden, secciones y tipografías.
slides/<id>.html     GENERADO. Una lámina por archivo (1920×1080, estilos en línea, notas en <aside>).
presentacion.html    GENERADO. La presentación completa en un solo archivo.
tools/               Generador del HTML y recursos de marca, copiados del repo de marca.
```

El Excel del mapeo y el documento de trabajo (`CLAUDE.md`) son internos y no se suben al repositorio.

## Cómo actualizarla

1. Edita `mapeo.js` (nunca las láminas a mano).
2. Corre `node generar.js` desde esta carpeta (`--pdf` para sacar también el PDF). Si algún texto nombra una cantidad que no cuadra con el conteo, el generador lo avisa.

## Marca

Sigue la plantilla común de las guías docentes PraxiLab: papel y tinta, Archivo / Instrument Sans / Courier Prime, nada bajo 24 px, sin esquinas redondas. La franja va en el azul de marca y cada simulador conserva su matiz junto a su nombre.

PraxiLab · praxilab.app
