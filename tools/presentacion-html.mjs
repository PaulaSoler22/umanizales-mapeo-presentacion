#!/usr/bin/env node
/**
 * praxilab-brand · presentación en un solo HTML
 *
 * Convierte una presentación guardada como archivos (deck.json + slides/<id>.html,
 * el formato del tipo Slides de claude.ai) en UN archivo HTML autocontenido:
 * tipografías incrustadas, logotipo incrustado, sin red ni cuenta de nadie.
 * Se abre con doble clic en cualquier navegador y se imprime a PDF desde él.
 *
 *   node praxilab-brand/presentacion-html.mjs <carpeta>            → <carpeta>/presentacion.html
 *   node praxilab-brand/presentacion-html.mjs <carpeta> <salida>
 *
 * <carpeta> es la que tiene deck.json y slides/ (en los simuladores,
 * docs/presentacion-docentes/). No cambia nada en ella salvo el archivo de salida.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const [carpetaArg, salidaArg] = process.argv.slice(2);
if (!carpetaArg) {
  console.error('Uso: node presentacion-html.mjs <carpeta con deck.json y slides/> [salida.html]');
  process.exit(2);
}
const CARPETA = resolve(carpetaArg);
const SALIDA = resolve(salidaArg ?? join(CARPETA, 'presentacion.html'));
const deck = JSON.parse(readFileSync(join(CARPETA, 'deck.json'), 'utf-8'));
const avisos = [];

// ── Tipografías: la copia local del manual, incrustada en base64 ───────────
const FUENTES = join(HERE, 'sistema-de-diseno', 'fuentes');
const fuentesCss = readFileSync(join(FUENTES, 'fuentes.css'), 'utf-8')
  .replace(/url\(([^)]+\.woff2)\)/g, (_, f) =>
    `url(data:font/woff2;base64,${readFileSync(join(FUENTES, f)).toString('base64')})`);

// ── Logotipo: las portadas lo enlazan como recurso de claude.ai (/_blob/…) ──
const LOGO = join(HERE, 'sistema-de-diseno', 'assets', 'Logos', 'praxilab_horizontal_negativo.svg');
const logoUri = `data:image/svg+xml;base64,${readFileSync(LOGO).toString('base64')}`;

// ── Elementos propios del editor de láminas → SVG que cualquier navegador dibuja ──
// Íconos: trazos de Lucide (licencia ISC), los que usan las guías docentes.
const ICONOS = {
  Book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  Chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  CheckCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  GraduationCap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  Lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  Warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
};
const FLECHAS = {
  'arrow-right': '0,30 60,30 60,0 100,50 60,100 60,70 0,70',
  'arrow-left': '100,30 40,30 40,0 0,50 40,100 40,70 100,70',
  'arrow-up': '30,100 30,40 0,40 50,0 100,40 70,40 70,100',
  'arrow-down': '30,0 30,60 0,60 50,100 100,60 70,60 70,0',
};
const sacar = (estilo, prop) => {
  const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`).exec(estilo);
  return m ? m[1].trim() : null;
};
const sinProp = (estilo, prop) => estilo.replace(new RegExp(`(?:^|;)\\s*${prop}\\s*:[^;]*`, 'g'), '').replace(/^;/, '');

function traducir(html, id) {
  return html
    .replace(/<x-shape kind="([a-z-]+)" style="([^"]*)"><\/x-shape>/g, (_, kind, st) => {
      const color = sacar(st, 'background') ?? '#0C1730';
      const caja = `${sinProp(st, 'background')};display:block;flex:none`;
      if (FLECHAS[kind]) return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="${caja}" aria-hidden="true"><polygon points="${FLECHAS[kind]}" fill="${color}"/></svg>`;
      if (kind === 'ellipse') return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="${caja}" aria-hidden="true"><ellipse cx="50" cy="50" rx="50" ry="50" fill="${color}"/></svg>`;
      if (kind === 'diamond') return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="${caja}" aria-hidden="true"><polygon points="50,0 100,50 50,100 0,50" fill="${color}"/></svg>`;
      if (kind === 'line') return `<div style="${caja};height:0;border-top:2px solid ${color}"></div>`;
      return `<div style="${st}"></div>`; // rect, rounded
    })
    .replace(/<x-icon name="([A-Za-z]+)" style="([^"]*)"><\/x-icon>/g, (_, nombre, st) => {
      if (!ICONOS[nombre]) avisos.push(`${id}: ícono «${nombre}» sin traducción (queda un cuadro vacío)`);
      const color = sacar(st, 'color') ?? 'currentColor';
      return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${sinProp(st, 'color')};display:block;flex:none" aria-hidden="true">${ICONOS[nombre] ?? '<rect x="3" y="3" width="18" height="18"/>'}</svg>`;
    })
    .replace(/<img([^>]*)src="\/?_blob\/[0-9a-f]+"([^>]*)>/g, (_, a, b) => {
      if (!/alt="PraxiLab"/.test(a + b)) avisos.push(`${id}: imagen subida a claude.ai que no es el logotipo (queda el logotipo en su lugar)`);
      return `<img${a}src="${logoUri}"${b}>`;
    })
    .replace(/<x-(connector|embed)[\s\S]*?<\/x-\1>/g, (m, t) => { avisos.push(`${id}: <x-${t}> no se traduce y se omite`); return ''; });
}

// ── Láminas en el orden del índice ─────────────────────────────────────────
const laminas = deck.order.map((id, i) => {
  const f = join(CARPETA, 'slides', `${id}.html`);
  if (!existsSync(f)) throw new Error(`deck.json lista «${id}» pero no existe slides/${id}.html`);
  let html = traducir(readFileSync(f, 'utf-8').trim(), id);
  const notas = (/<aside>([\s\S]*?)<\/aside>/.exec(html)?.[1] ?? '').trim();
  html = html.replace(/<aside>[\s\S]*?<\/aside>/, '')
    .replace(/^<section /, `<section data-n="${i + 1}" `);
  return { id, html, notas };
});
const seccionDe = {};
for (const s of Object.values(deck.sections ?? {})) seccionDe[s.start] = s.description;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const notasJson = JSON.stringify(laminas.map((l) => l.notas)).replace(/</g, '\\u003c');
const seccionesJson = JSON.stringify(laminas.map((l) => seccionDe[l.id] ?? null)).replace(/</g, '\\u003c');

const pagina = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(deck.title)}</title>
<!-- Generado por praxilab-brand/presentacion-html.mjs desde deck.json + slides/. No editar a mano. -->
<style>
${fuentesCss}
*,*::before,*::after{box-sizing:border-box;margin:0}
html,body{height:100%}
body{background:#0C1730;color:#FFFFFF;font-family:'Instrument Sans',Arial,sans-serif;overflow:hidden}
#escenario{position:fixed;inset:0 0 56px 0;display:flex;align-items:center;justify-content:center}
:fullscreen #escenario{bottom:0}
#lienzo{position:relative;width:1920px;height:1080px;flex:none;transform-origin:center center;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
#lienzo>section{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;display:flex;flex-direction:column;visibility:hidden;opacity:0;transition:opacity .18s}
#lienzo>section.activa{visibility:visible;opacity:1}
section div:not([style*="display"]){display:flex;flex-direction:column}
section h1,section h2,section h3,section p,section li{overflow-wrap:break-word}
section ul,section ol{padding-left:1.2em}
section table{border-collapse:collapse;width:100%}
section th,section td{text-align:left;vertical-align:top;padding:.35em .6em;border-bottom:1px solid #DDE3EE}
section th{font-weight:700;border-bottom:2px solid currentColor}
section img{display:block}
#barra{position:fixed;left:0;right:0;bottom:0;display:flex;align-items:center;gap:16px;padding:10px 16px;font:14px/1.4 'Instrument Sans',Arial,sans-serif;background:rgba(12,23,48,.92);transition:opacity .2s}
#barra button{font:inherit;color:#FFFFFF;background:transparent;border:1px solid rgba(255,255,255,.3);padding:6px 12px;cursor:pointer}
#barra button:hover{border-color:#FFFFFF}
#barra button:focus-visible{outline:2px solid #4C8DFF;outline-offset:2px}
#barra .cuenta{font-family:'Courier Prime','Courier New',monospace;letter-spacing:.06em;color:#B6B9C1;min-width:7ch}
#barra .seccion{flex:1;color:#9297A2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
body.quieto #barra{opacity:0}
#notas{position:fixed;right:0;top:0;bottom:56px;width:min(420px,100%);padding:20px;background:#FFFFFF;color:#0C1730;font:16px/1.6 'Instrument Sans',Arial,sans-serif;overflow:auto;display:none;border-left:1px solid #DDE3EE}
#notas h2{font:700 12px/1.4 'Courier Prime','Courier New',monospace;letter-spacing:.1em;text-transform:uppercase;color:#5F6B85;margin-bottom:12px}
body.con-notas #notas{display:block}
@media (prefers-reduced-motion:reduce){#lienzo>section,#barra{transition:none}}
@media print{
  @page{size:1920px 1080px;margin:0}
  html,body{height:auto;overflow:visible;background:#FFFFFF}
  #barra,#notas{display:none!important}
  #escenario{position:static;display:block}
  #lienzo{transform:none!important;width:1920px;height:auto;box-shadow:none}
  #lienzo>section{position:relative;visibility:visible;opacity:1;break-after:page;page-break-after:always}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
</head>
<body>
<div id="escenario"><div id="lienzo">
${laminas.map((l) => l.html).join('\n')}
</div></div>
<aside id="notas" aria-live="polite"><h2>Notas del presentador</h2><div id="texto-notas"></div></aside>
<nav id="barra" aria-label="Navegación de la presentación">
  <button type="button" id="ant" aria-label="Lámina anterior">‹ Anterior</button>
  <button type="button" id="sig" aria-label="Lámina siguiente">Siguiente ›</button>
  <span class="cuenta" id="cuenta"></span>
  <span class="seccion" id="seccion"></span>
  <button type="button" id="btn-notas" aria-pressed="false">Notas (N)</button>
  <button type="button" id="btn-pantalla">Pantalla completa (F)</button>
</nav>
<script>
(() => {
  const notas = ${notasJson};
  const secciones = ${seccionesJson};
  const laminas = [...document.querySelectorAll('#lienzo>section')];
  const lienzo = document.getElementById('lienzo');
  let actual = 0, seccion = '';
  const ajustar = () => {
    const ancho = innerWidth - (document.body.classList.contains('con-notas') ? Math.min(420, innerWidth) : 0);
    const alto = innerHeight - (document.fullscreenElement ? 0 : 56);
    const e = Math.min(ancho / 1920, alto / 1080);
    lienzo.style.transform = 'scale(' + e + ')';
    lienzo.style.marginRight = document.body.classList.contains('con-notas') ? Math.min(420, innerWidth) + 'px' : '0';
  };
  const ir = (n) => {
    actual = Math.max(0, Math.min(laminas.length - 1, n));
    laminas.forEach((s, i) => s.classList.toggle('activa', i === actual));
    for (let i = actual; i >= 0; i--) if (secciones[i]) { seccion = secciones[i]; break; }
    document.getElementById('cuenta').textContent = String(actual + 1).padStart(2, '0') + ' / ' + laminas.length;
    document.getElementById('seccion').textContent = seccion;
    document.getElementById('texto-notas').textContent = notas[actual] || 'Esta lámina no tiene notas.';
    if (location.hash !== '#' + (actual + 1)) history.replaceState(null, '', '#' + (actual + 1));
  };
  const notasOnOff = () => {
    const b = document.body.classList.toggle('con-notas');
    document.getElementById('btn-notas').setAttribute('aria-pressed', String(b));
    ajustar();
  };
  const pantalla = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };
  document.getElementById('ant').onclick = () => ir(actual - 1);
  document.getElementById('sig').onclick = () => ir(actual + 1);
  document.getElementById('btn-notas').onclick = notasOnOff;
  document.getElementById('btn-pantalla').onclick = pantalla;
  document.getElementById('escenario').addEventListener('click', (e) => ir(actual + (e.clientX > innerWidth / 2 ? 1 : -1)));
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); ir(actual + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); ir(actual - 1); }
    else if (e.key === 'Home') ir(0);
    else if (e.key === 'End') ir(laminas.length - 1);
    else if (e.key === 'n' || e.key === 'N') notasOnOff();
    else if (e.key === 'f' || e.key === 'F') pantalla();
  });
  let reposo;
  addEventListener('mousemove', () => {
    document.body.classList.remove('quieto');
    clearTimeout(reposo);
    reposo = setTimeout(() => document.body.classList.add('quieto'), 2500);
  });
  addEventListener('resize', ajustar);
  document.addEventListener('fullscreenchange', ajustar);
  addEventListener('hashchange', () => ir((parseInt(location.hash.slice(1), 10) || 1) - 1));
  ajustar();
  ir((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
</script>
</body>
</html>
`;

writeFileSync(SALIDA, pagina);
console.log(`${deck.title}: ${laminas.length} láminas → ${SALIDA} (${(pagina.length / 1024).toFixed(0)} KB)`);
for (const a of avisos) console.log('  aviso: ' + a);
