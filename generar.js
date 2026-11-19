// Genera la presentación de mapeo curricular PraxiLab en el formato de las guías docentes:
//   mapeo.js + catalogo.js  →  deck.json + slides/<id>.html  →  presentacion.html
//
// Uso (desde la carpeta de la presentación):
//   node generar.js          láminas + presentacion.html
//   node generar.js --pdf    además, «<Universidad> - Mapeo curricular PraxiLab.pdf» (Chrome)
//
// No se edita por universidad: lo que cambia va en mapeo.js; los datos de los simuladores, en
// catalogo.js. slides/ y presentacion.html se sobrescriben en cada corrida.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const M = require('./mapeo.js');
const CAT = require('./catalogo.js');

// ── Sistema de diseño (el de las guías docentes PraxiLab) ───────────────────
const INK = '#0C1730', MUTED = '#55617A', FOOT = '#5F6B85', RULE = '#DDE3EE', ALT = '#F3F5F9';
const DARK_MUTED = '#B6B9C1', DARK_EYEBROW = '#9297A2';
const BRAND = '#0B3C8C', BRAND_ON_DARK = '#4C8DFF';
const MONO = "font-family:'Courier Prime', 'Courier New', monospace";
const DISPLAY = "font-family:'Archivo', 'Arial Narrow', sans-serif;font-weight:600;font-stretch:112%;letter-spacing:-1px";
const PIE = `PraxiLab en ${M.universidad.corto} · Mapeo curricular`;

// ── Validar y contar ─────────────────────────────────────────────────────────
const errores = [];
const norm = (s) => CAT[s] && s !== 'alias' ? s : CAT.alias[String(s).toLowerCase().trim()];
for (const p of M.programas) {
  for (const f of p.filas) {
    f.simuladores = f.simuladores.map((s) => {
      const n = norm(s);
      if (!n) errores.push(`Simulador desconocido «${s}» en ${p.nombre} / ${f.asignatura}: añádelo a catalogo.js desde su guía docente.`);
      return n || s;
    });
    if (!['directa', 'apoyo'].includes(f.encaje)) errores.push(`Encaje «${f.encaje}» en ${f.asignatura}: debe ser 'directa' o 'apoyo'.`);
    if (!Number.isInteger(f.sem)) errores.push(`Semestre «${f.sem}» en ${f.asignatura}: debe ser un número.`);
  }
  p.filas.sort((a, b) => a.sem - b.sem); // estable: respeta el orden del Excel dentro del semestre
}
if (errores.length) { console.error(errores.join('\n')); process.exit(1); }

const filas = M.programas.flatMap((p) => p.filas);
const usados = new Set(filas.flatMap((f) => f.simuladores));
const SIMS = Object.keys(CAT).filter((k) => k !== 'alias' && usados.has(k)); // en orden del catálogo
const C = {
  asignaturas: filas.length,
  directa: filas.filter((f) => f.encaje === 'directa').length,
  apoyo: filas.filter((f) => f.encaje === 'apoyo').length,
  simuladores: SIMS.length,
  programas: M.programas.length,
  semMin: Math.min(...filas.map((f) => f.sem)),
  semMax: Math.max(...filas.map((f) => f.sem)),
};
const PALABRA = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
const palabra = (n) => PALABRA[n] || String(n);
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const lista = (xs) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
// Unidad del plan de estudios: «semestre» por defecto; «periodo» en programas que así lo llaman.
const UNIDAD = M.universidad.periodo || 'semestre';
const ord = (n) => `${n}.º`;

// Avisos: textos de mapeo.js que nombran una cantidad que no sale del conteo. «un/una» se
// ignoran (casi siempre son artículos). Para asignaturas vale el total, las directas, las de
// apoyo o las de un programa.
const NUM = { dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };
function revisar(donde, texto, validos) {
  const re = /\b(\d+|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(asignaturas?|simuladore?s?|programas?|pregrados?)\b/gi;
  for (const [, n, cosa] of String(texto).matchAll(re)) {
    const k = /^asig/i.test(cosa) ? 'asignaturas' : /^sim/i.test(cosa) ? 'simuladores' : 'programas';
    const v = /^\d+$/.test(n) ? +n : NUM[n.toLowerCase()];
    if (!validos[k].includes(v)) console.warn(`⚠️  ${donde} dice «${n} ${cosa}», pero el conteo da ${validos[k].join(' / ')}.`);
  }
}
const VAL = {
  asignaturas: [...new Set([C.asignaturas, C.directa, C.apoyo, ...M.programas.map((p) => p.filas.length)])],
  simuladores: [C.simuladores], programas: [C.programas],
};
for (const [donde, obj] of Object.entries({ portada: M.portada, cifras: M.cifras, seccionFicha: M.seccionFicha, modelos: M.modelos, cierre: M.cierre })) {
  for (const [campo, texto] of Object.entries(obj)) revisar(`${donde}.${campo}`, texto, VAL);
}
for (const p of M.programas) {
  const v = { asignaturas: [p.filas.length, p.filas.filter((f) => f.encaje === 'directa').length, p.filas.filter((f) => f.encaje === 'apoyo').length],
    simuladores: [new Set(p.filas.flatMap((f) => f.simuladores)).size], programas: [1] };
  for (const campo of ['titulo', 'notas']) revisar(`${p.nombre}.${campo}`, p[campo], v);
  if (p.lineas) for (const campo of ['titulo', 'nota', 'notas']) revisar(`${p.nombre}.lineas.${campo}`, p.lineas[campo], v);
}

// ── Piezas ───────────────────────────────────────────────────────────────────
const slides = [];
const n2 = (i) => String(i).padStart(2, '0');
const pie = (num, dark) => `<p style="position:absolute;left:128px;bottom:64px;width:1664px;${MONO};font-size:24px;color:${dark ? DARK_EYEBROW : FOOT}">${PIE} · ${n2(num)}</p>`;
const eyebrow = (t, dark) => `<p style="${MONO};font-size:24px;text-transform:uppercase;letter-spacing:2.4px;color:${dark ? DARK_EYEBROW : BRAND}">${t}</p>`;
const sim = (name) => `<span style="display:inline-block;width:18px;height:18px;background:${CAT[name].color};margin-right:14px;vertical-align:middle"></span>${name}`;
// Cada lámina es una función del número que ocupa, para que los pies se numeren solos.
const add = (id, fn) => slides.push({ id, fn });
const pos = (id) => slides.findIndex((s) => s.id === id) + 1;

const paper = (id, kicker, title, body, notes) => (num) => `<section id="${id}" data-transition="fade" style="background:#FFFFFF;color:${INK};font-family:'Instrument Sans', Arial, sans-serif;padding:128px 128px 160px;display:flex;flex-direction:column;gap:44px">
<div style="position:absolute;left:0;top:0;width:1920px;height:12px;background:${BRAND}"></div>
<div style="display:flex;flex-direction:column;gap:16px">
${eyebrow(kicker)}
<h2 style="${DISPLAY};font-size:60px;line-height:1.15;color:${INK}">${title}</h2>
</div>
${typeof body === 'function' ? body() : body}
${pie(num)}
<aside>${notes}</aside>
</section>`;
const divider = (id, kicker, title, sub, notes) => (num) => `<section id="${id}" data-transition="fade" style="background:${INK};color:#FFFFFF;font-family:'Instrument Sans', Arial, sans-serif;padding:128px;display:flex;flex-direction:column;justify-content:center;gap:40px">
<div style="position:absolute;left:0;top:0;width:24px;height:1080px;background:${BRAND_ON_DARK}"></div>
${eyebrow(kicker, true)}
<h2 style="${DISPLAY};font-size:88px;line-height:1.1;color:#FFFFFF;width:1500px">${title}</h2>
<p style="font-size:32px;line-height:1.45;color:${DARK_MUTED};width:1300px">${sub}</p>
${pie(num, true)}
<aside>${notes}</aside>
</section>`;
function rows(items, { fig = 0, label = 380 } = {}) {
  return `<div style="display:flex;flex-direction:column">\n` + items.map((it, i) => {
    const last = i === items.length - 1;
    const border = `border-top:${i === 0 ? '2px solid ' + INK : '1px solid ' + RULE};${last ? 'border-bottom:2px solid ' + INK + ';' : ''}`;
    const f = fig ? `<p style="width:${fig}px;${MONO};font-size:40px;font-weight:700;color:${BRAND}">${it.fig}</p>\n` : '';
    return `<div style="display:flex;gap:32px;align-items:baseline;${border}padding:18px 0">
${f}<p style="width:${label}px;font-size:28px;font-weight:700;color:${INK}">${it.label}</p>
<p style="flex:1;font-size:28px;line-height:1.4;color:${MUTED}">${it.text}</p>
</div>`;
  }).join('\n') + `\n</div>`;
}
const note = (html) => `<div style="border-top:2px solid ${INK};padding-top:20px"><p style="font-size:28px;line-height:1.4;color:${INK}">${html}</p></div>`;
function table(widths, head, body, size = 28) {
  const th = head.map((h, i) => `<th style="width:${widths[i]}%">${h}</th>`).join('');
  const tr = body.map((r, i) => `<tr${i % 2 ? ` style="background:${ALT}"` : ''}>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n');
  return `<table style="font-size:${size}px;line-height:1.35;color:${INK}">\n<tr>${th}</tr>\n${tr}\n</table>`;
}

// ── 01 · Portada ─────────────────────────────────────────────────────────────
add('cover', () => `<section id="cover" data-transition="fade" style="background:${INK};color:#FFFFFF;font-family:'Instrument Sans', Arial, sans-serif;padding:128px;display:flex;flex-direction:column;justify-content:space-between">
<div style="position:absolute;left:0;bottom:0;width:1920px;height:20px;background:${BRAND_ON_DARK}"></div>
<img src="/_blob/00000000000000000000000000000000" alt="PraxiLab" style="width:260px;height:80px;object-fit:contain">
<div style="display:flex;flex-direction:column;gap:32px">
${eyebrow(M.portada.eyebrow, true)}
<h1 style="${DISPLAY};font-size:176px;line-height:1;color:#FFFFFF">${M.universidad.corto}</h1>
<p style="${DISPLAY};font-size:60px;line-height:1.15;color:#FFFFFF;width:1500px">${M.portada.subtitulo}</p>
</div>
<p style="${MONO};font-size:24px;text-transform:uppercase;letter-spacing:2.4px;color:${DARK_EYEBROW}">${M.universidad.completo} · ${M.universidad.pensum}</p>
<aside>${M.portada.notas}</aside>
</section>`);

// ── 02 · El mapeo en cifras (cifras calculadas) ─────────────────────────────
const cif = [{ fig: String(C.asignaturas), label: C.asignaturas === 1 ? 'Asignatura' : 'Asignaturas', text: M.cifras.asignaturas }];
if (C.programas > 1) cif.push({ fig: String(C.programas), label: 'Programas', text: M.cifras.programas });
if (C.directa) cif.push({ fig: String(C.directa), label: 'De aplicación directa', text: M.cifras.directa });
if (C.apoyo) cif.push({ fig: String(C.apoyo), label: 'Como apoyo al curso', text: M.cifras.apoyo });
cif.push({ fig: String(C.simuladores), label: C.simuladores === 1 ? 'Simulador' : 'Simuladores', text: lista(SIMS) + '.' });
cif.push({ fig: C.semMin === C.semMax ? ord(C.semMin) : `${ord(C.semMin)}–${ord(C.semMax)}`, label: C.semMin === C.semMax ? Cap(UNIDAD) : Cap(UNIDAD) + 's', text: M.cifras.semestres });
add('en-cifras', paper('en-cifras', '01 · El mapeo', M.cifras.titulo,
  rows(cif, { fig: 200, label: 360 }) + '\n' + note(M.cifras.nota), M.cifras.notas));

// ── 03–04 · Los simuladores (datos de catalogo.js) ──────────────────────────
add('sec-simuladores', divider('sec-simuladores', '02 · Los simuladores',
  C.simuladores === 1 ? 'Un caso profesional completo' : `${Cap(palabra(C.simuladores))} casos profesionales completos`,
  'El estudiante no responde preguntas sobre la norma: hace el trabajo del contador y entrega lo que entregaría un contador.',
  `Esta sección presenta ${C.simuladores === 1 ? 'el simulador PraxiLab que aparece' : `los ${palabra(C.simuladores)} simuladores PraxiLab que aparecen`} en el mapeo. Todos están pensados para el pregrado en Contaduría Pública en Colombia.`));
add('simuladores', paper('simuladores', '02 · Los simuladores', C.simuladores === 1 ? 'Qué hace el estudiante' : 'Qué hace el estudiante en cada uno',
  table([20, 47, 33], ['Simulador', 'El estudiante…', 'Formato'], SIMS.map((s) => [sim(s), CAT[s].hace, CAT[s].formato]), 26),
  'Datos tomados de la guía para docentes de cada simulador. ' + SIMS.map((s) => CAT[s].nota).join(' ') + ' Las horas son trabajo autónomo del estudiante y son estimaciones de cada guía.'));

// ── 05… · Fichas de programa ────────────────────────────────────────────────
const uno = M.programas.length === 1;
const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
add('sec-ficha', divider('sec-ficha', '03 · ' + M.seccionFicha.eyebrow, M.seccionFicha.titulo, M.seccionFicha.sub, M.seccionFicha.notas));
const directa = `<b>De aplicación directa</b>`;
const apoyo = `<span style="color:${MUTED}">Como apoyo al curso</span>`;
for (const p of M.programas) {
  const sfx = uno ? '' : '-' + slug(p.nombre);
  const tipos = new Set(p.filas.map((f) => f.encaje));
  const defs = [];
  if (tipos.has('directa')) defs.push({ label: 'De aplicación directa', text: 'El simulador cubre el núcleo de la asignatura y se usa sin modificar el temario ni la evaluación.' });
  if (tipos.has('apoyo')) defs.push({ label: 'Como apoyo al curso', text: 'El simulador se integra a lo que el docente ya enseña. El docente conserva el control del curso.' });
  add('ficha' + sfx, paper('ficha' + sfx, uno ? '03 · La ficha del programa' : '03 · ' + p.nombre, p.titulo,
    table([10, 34, 30, 26], [Cap(UNIDAD).slice(0, 3) + '.', 'Asignatura', 'Simulador', 'Encaje'], p.filas.map((f) => [
      `<span style="${MONO};font-weight:700;color:${BRAND}">${ord(f.sem)}</span>`, f.asignatura,
      f.simuladores.map(sim).join('<br>'), f.encaje === 'directa' ? directa : apoyo,
    ])) + '\n' + rows(defs), p.notas));
  if (p.lineas) {
    add('lineas' + sfx, paper('lineas' + sfx, uno ? '03 · Lo que gana el programa' : '03 · Lo que gana ' + p.nombre, p.lineas.titulo,
      rows(p.lineas.filas, { label: 300 }) + '\n' + note(p.lineas.nota), p.lineas.notas));
  }
}

// ── Cómo se lleva al curso ──────────────────────────────────────────────────
add('sec-uso', divider('sec-uso', '04 · Cómo se lleva al curso', 'El simulador se ajusta al curso que el docente ya dicta',
  'No al revés. Hay tres formas de integrarlo, según el encaje de cada asignatura.',
  'Esta sección muestra las formas de llevar el simulador a una asignatura existente y la evidencia de aprendizaje que deja cada uno.'));
add('modelos', paper('modelos', '04 · Tres formas de uso', 'Del caso completo a la fuente de datos', () => rows([
  { fig: 'A', label: 'El simulador es el curso', text: M.modelos.A },
  { fig: 'B', label: 'El simulador es un módulo', text: M.modelos.B },
  { fig: 'C', label: 'El simulador es la fuente de datos', text: M.modelos.C },
], { fig: 80, label: 420 }) + '\n' + note(`La duración la fija cada simulador (lámina ${n2(pos('simuladores'))}) y el docente decide el peso en la nota.`),
M.modelos.notas));

const saber = ['RentaSim', 'AudiTek'].filter((s) => usados.has(s));
const dilemas = ['AudiTek', 'ProcediTek'].filter((s) => usados.has(s));
const objeto = saber.length === 2 ? 'un ajuste o un hallazgo' : saber[0] === 'RentaSim' ? 'un ajuste' : 'un hallazgo';
add('evidencia', paper('evidencia', '04 · Evidencia de aprendizaje', 'Cada caso deja evidencia trazable',
  table([24, 76], ['Simulador', 'Lo que entrega el estudiante'], SIMS.map((s) => [sim(s), CAT[s].evidencia]), 26) + '\n' +
  note('Es el tipo de evidencia que pide la acreditación: decisiones sustentadas, por escrito, de cada estudiante.'),
  'Entregables tomados de la guía para docentes de cada simulador.' +
  (saber.length ? ` ${lista(saber)} ${saber.length > 1 ? 'citan' : 'cita'} como referente el módulo de Información y Control Contable de Saber Pro: se evalúa el criterio para sustentar ${objeto}, no la memoria.` : '') +
  (dilemas.length
    ? ` De paso quedan cubiertas competencias genéricas: razonamiento cuantitativo, comunicación escrita y ética profesional (${dilemas.length > 1 ? 'los dilemas' : 'el dilema'} de ${lista(dilemas)} ${dilemas.length > 1 ? 'ponen' : 'pone'} al estudiante ante la responsabilidad de quien firma).`
    : ' De paso quedan cubiertas competencias genéricas: razonamiento cuantitativo y comunicación escrita.')));

// ── Cierre (contactos PraxiLab fijos) ───────────────────────────────────────
add('cierre', (num) => `<section id="cierre" data-transition="fade" style="background:${INK};color:#FFFFFF;font-family:'Instrument Sans', Arial, sans-serif;padding:128px;display:flex;flex-direction:column;justify-content:center;gap:40px">
<div style="position:absolute;left:0;top:0;width:24px;height:1080px;background:${BRAND_ON_DARK}"></div>
${eyebrow('05 · Siguiente paso', true)}
<h2 style="${DISPLAY};font-size:88px;line-height:1.1;color:#FFFFFF;width:1600px">${M.cierre.titulo}</h2>
<div style="display:flex;gap:96px">
<div style="display:flex;flex-direction:column;gap:8px"><p style="font-size:32px;color:#FFFFFF">paula@praxilab.app</p><p style="${MONO};font-size:28px;color:${DARK_MUTED}">WhatsApp 318 975 6987</p></div>
<div style="display:flex;flex-direction:column;gap:8px"><p style="font-size:32px;color:#FFFFFF">leisy@praxilab.app</p><p style="${MONO};font-size:28px;color:${DARK_MUTED}">WhatsApp 301 790 3086</p></div>
</div>
<p style="font-size:32px;line-height:1.45;color:${DARK_MUTED}">PraxiLab · praxilab.app</p>
${pie(num, true)}
<aside>${M.cierre.notas}</aside>
</section>`);

// ── Escribir ─────────────────────────────────────────────────────────────────
const SL = path.join(DIR, 'slides');
fs.mkdirSync(SL, { recursive: true });
for (const f of fs.readdirSync(SL)) if (f.endsWith('.html')) fs.unlinkSync(path.join(SL, f));
slides.forEach((s, i) => fs.writeFileSync(path.join(SL, s.id + '.html'), s.fn(i + 1) + '\n'));

const deck = {
  v: 4, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, lists: 'css',
  title: PIE,
  order: slides.map((s) => s.id),
  sections: {
    s1: { description: 'Qué se revisó y las cifras del mapeo.', start: 'cover' },
    s2: { description: C.simuladores === 1 ? 'El simulador PraxiLab del mapeo.' : `Los ${palabra(C.simuladores)} simuladores PraxiLab del mapeo.`, start: 'sec-simuladores' },
    s3: { description: uno ? `La ficha del programa de ${M.programas[0].nombre}${M.programas[0].lineas ? ' y lo que gana' : ''}.` : 'Las fichas de los programas.', start: 'sec-ficha' },
    s4: { description: 'Cómo se lleva el simulador al curso y la evidencia que deja.', start: 'sec-uso' },
    s5: { description: 'Siguiente paso y contacto.', start: 'cierre' },
  },
  faces: {
    archivo: { family: 'Archivo', href: 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..700&display=swap' },
    'instrument-sans': { family: 'Instrument Sans', href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=swap' },
    'courier-prime': { family: 'Courier Prime', href: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap' },
  },
  designSystems: [],
};
fs.writeFileSync(path.join(DIR, 'deck.json'), JSON.stringify(deck));

console.log(`Conteo (cuadra los textos de mapeo.js con esto):
  ${C.asignaturas} asignaturas · ${C.directa} de aplicación directa · ${C.apoyo} como apoyo · ${C.simuladores} simuladores (${SIMS.join(', ')})
  semestres ${ord(C.semMin)}–${ord(C.semMax)} · ${C.programas} programa(s)
${slides.length} láminas: ${deck.order.join(', ')}`);

execFileSync(process.execPath, [path.join(DIR, 'tools', 'presentacion-html.mjs'), DIR], { stdio: 'inherit' });

if (process.argv.includes('--pdf')) {
  const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  if (!chrome) { console.error('No encontré Chrome: abre presentacion.html e imprime → Guardar como PDF.'); process.exit(1); }
  const pdf = path.join(DIR, `${M.universidad.corto} - Mapeo curricular PraxiLab.pdf`);
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=8000',
    `--print-to-pdf=${pdf}`, 'file:///' + path.join(DIR, 'presentacion.html').replace(/\\/g, '/')], { stdio: 'ignore' });
  console.log('PDF → ' + pdf);
}
