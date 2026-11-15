// Genera los archivos de marca de Fixer (SVG) y una hoja de vista previa.
// Uso (desde la raíz del repositorio):  node marca/generar.mjs
//
// Lenguaje visual: trazo continuo del mismo grosor y esquinas redondeadas.
//  - Icono: cuadrado verde azulado con un techo y una llave (la casa que se repara).
//  - Nombre: letras de trazo, con un techo como punto de la «i».
import { writeFileSync } from 'node:fs';

export const C = { ink: '#12304f', teal: '#17908f', tealDark: '#0b5566', mint: '#7fd6d3', white: '#ffffff' };

/* ---------- Icono (lienzo 64 x 64) ---------- */
const WRENCH = 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z';
export const glyph = (sw = 5) => `<g fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <path class="roof" d="M11.5 28 32 11.5 52.5 28"/>
    <path class="chim" d="M44 19.5V12.5"/>
    <path class="wr" transform="translate(51 26) scale(-1.5 1.5)" stroke-width="${(sw / 1.5).toFixed(2)}" d="${WRENCH}"/>
  </g>`;

const degradado = (id) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c9ba0"/><stop offset="1" stop-color="${C.tealDark}"/></linearGradient>`;

export const icono = (id = 'g') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Fixer"><defs>${degradado(id)}</defs>
  <rect width="64" height="64" rx="17" fill="url(#${id})"/>
  ${glyph()}
</svg>`;

/* Versión sin esquinas (para íconos de aplicación: el teléfono pone su propia máscara) */
export const iconoApp = (id = 'g') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Fixer"><defs>${degradado(id)}</defs>
  <rect width="64" height="64" fill="url(#${id})"/>
  <g transform="translate(6.4 6.4) scale(.8)">${glyph(4.6)}</g>
</svg>`;

/* ---------- Nombre (lienzo 190 x 70) ---------- */
export const nombreDentro = (ink, acento) => `
    <g fill="none" stroke="${ink}" stroke-width="8.6" stroke-linecap="round" stroke-linejoin="round">
      <path class="l1" d="M6 62V10H33M6 35H28"/>
      <path class="l2" d="M56 62V33"/>
      <path class="l3" d="M75 33 100 62M100 33 75 62"/>
      <path class="l4" d="M116 48H143A14 14 0 1 0 138 59"/>
      <path class="l5" d="M163 62V33M163 47Q164 33 178 33"/>
    </g>
    <path class="dot" d="M56 4 68 16H44Z" fill="${acento}" stroke="${acento}" stroke-width="3" stroke-linejoin="round"/>`;

export const nombre = (ink = C.ink, acento = C.teal) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 70" role="img" aria-label="Fixer">${nombreDentro(ink, acento)}
</svg>`;

/* ---------- Logotipos completos ---------- */
export const horizontal = (ink = C.ink, acento = C.teal, id = 'g') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 70" role="img" aria-label="Fixer"><defs>${degradado(id)}</defs>
  <g transform="translate(0 3) scale(1.0)"><rect width="64" height="64" rx="17" fill="url(#${id})"/>${glyph()}</g>
  <g transform="translate(82 0)">${nombreDentro(ink, acento)}</g>
</svg>`;

export const vertical = (ink = C.ink, acento = C.teal, id = 'g') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 150" role="img" aria-label="Fixer"><defs>${degradado(id)}</defs>
  <g transform="translate(63 0)"><rect width="64" height="64" rx="17" fill="url(#${id})"/>${glyph()}</g>
  <g transform="translate(0 80)">${nombreDentro(ink, acento)}</g>
</svg>`;

const archivos = {
  'icono.svg': icono(),
  'icono-app.svg': iconoApp(),
  'nombre.svg': nombre(),
  'nombre-blanco.svg': nombre(C.white, C.mint),
  'logo-horizontal.svg': horizontal(),
  'logo-horizontal-blanco.svg': horizontal(C.white, C.mint),
  'logo-vertical.svg': vertical(),
  'logo-vertical-blanco.svg': vertical(C.white, C.mint)
};

if (process.argv[1] && process.argv[1].endsWith('generar.mjs')) {
  const dir = new URL('./', import.meta.url);
  for (const [n, s] of Object.entries(archivos)) writeFileSync(new URL(n, dir), s + '\n');
  const celda = (svg, fondo, w) => `<div class="c" style="background:${fondo}"><div style="width:${w}px">${svg}</div></div>`;
  writeFileSync(new URL('index.html', dir), `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marca Fixer</title>
<style>body{margin:0;font:15px system-ui;background:#eef3f6;color:#12304f;padding:32px}h1{margin:0 0 24px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px}.c{border-radius:20px;border:1px solid #d6e1e9;padding:32px;display:grid;place-items:center;min-height:200px}.c svg{width:100%;height:auto;display:block}</style>
<h1>Marca Fixer</h1><div class="g">
${celda(horizontal(C.ink, C.teal, 'a1'), '#fff', 300)}${celda(vertical(C.ink, C.teal, 'a2'), '#fff', 220)}
${celda(horizontal(C.white, C.mint, 'a3'), '#06172b', 300)}${celda(vertical(C.white, C.mint, 'a4'), '#06172b', 220)}
${celda(icono('a5'), '#fff', 150)}${celda(iconoApp('a6'), '#eef3f6', 150)}${celda(nombre(), '#fff', 220)}${celda(nombre(C.white, C.mint), '#12304f', 220)}
</div></html>`);
  console.log('Marca generada:', Object.keys(archivos).join(', '));
}
