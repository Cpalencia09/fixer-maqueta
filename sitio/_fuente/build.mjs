// Genera las páginas del sitio de Fixer en la carpeta /sitio.
// Uso (desde la raíz del repositorio):  node sitio/_fuente/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const RAIZ = new URL('../../', import.meta.url);
const SALIDA = new URL('../', import.meta.url);

/* ---------- Iconos (trazo, estilo Lucide) ---------- */
const P = {
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  snow: '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/><path d="m9 3 3 2 3-2M9 21l3-2 3 2"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
  hammer: '<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
  anvil: '<path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h4"/><path d="M7 5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1 7 7 0 0 1-7 7H8a1 1 0 0 1-1-1z"/><path d="M9 12v5"/><path d="M15 12v5"/><path d="M5 20a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1"/>',
  ship: '<path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  chef: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  shieldOk: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  badge: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  idcard: '<rect width="18" height="14" x="3" y="5" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M15 9h3M15 13h3M6 17c.5-1.5 1.5-2 3-2s2.5.5 3 2"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  share: '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  plus: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8M8 12h8"/>',
  dots: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
  apple: '<path d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.3 1.3-2.7 1.3-2.7s-2.6-1-2.7-4zM14 5.5c.7-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z" fill="currentColor" stroke="none"/>',
  play: '<path d="M6 3.5v17a1 1 0 0 0 1.5.86l14-8.5a1 1 0 0 0 0-1.72l-14-8.5A1 1 0 0 0 6 3.5z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>'
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Datos ---------- */
const RUBROS = [
  ['plomeria', 'Plomería', 'drop', '#0ea5e9', 'Fugas, destapes, sanitarios y sistemas de agua.'],
  ['refrigeracion', 'Refrigeración', 'snow', '#0284c7', 'Aires acondicionados, neveras y congeladores.'],
  ['electricista', 'Electricista', 'zap', '#d98a00', 'Tableros, iluminación y cortocircuitos.'],
  ['electroauto', 'Electro auto', 'car', '#6366f1', 'Baterías, alternadores y sensores.'],
  ['mecanico', 'Mecánico', 'wrench', '#ea580c', 'Afinamiento, frenos, suspensión y motor.'],
  ['carpintero', 'Carpintero', 'hammer', '#b45309', 'Muebles, puertas y gabinetes a medida.'],
  ['herrero', 'Herrero', 'anvil', '#dc2626', 'Rejas, portones, barandas y soldadura.'],
  ['marinero', 'Marinero', 'ship', '#0e7490', 'Limpieza y mantenimiento de embarcaciones.'],
  ['chef', 'Chef', 'chef', '#e11d48', 'Cocina a domicilio, eventos y catering.'],
  ['senora', 'Señora doméstica', 'sparkles', '#c026d3', 'Limpieza profunda, lavado y planchado.'],
  ['ninera', 'Niñera', 'smile', '#db2777', 'Cuidado infantil con experiencia.'],
  ['barbero', 'Barbero', 'scissors', '#0d9488', 'Corte y barba a domicilio.'],
  ['piscinero', 'Piscinero', 'waves', '#0891b2', 'Limpieza y tratamiento de piscinas.'],
  ['jardinero', 'Jardinero', 'leaf', '#16a34a', 'Poda, siembra y mantenimiento de jardines.']
];

const NAV = [
  ['index.html', 'Inicio'],
  ['como-funciona.html', 'Cómo funciona'],
  ['tecnicos.html', 'Para técnicos'],
  ['descargar.html', 'Descargar'],
  ['contacto.html', 'Contacto']
];

const FAQ = {
  General: [
    ['¿Qué es Fixer?', '<p>Fixer es una plataforma que conecta a personas que necesitan un servicio con técnicos y profesionales independientes de su zona: plomeros, electricistas, mecánicos, carpinteros y más.</p><p>Cada técnico pasa por una verificación de identidad y el pago queda en custodia hasta que el trabajo esté hecho.</p>'],
    ['¿En qué zonas funciona?', '<p>Estamos abriendo zonas poco a poco, según haya técnicos verificados que las cubran. Si tu zona aún no aparece, <a href="contacto.html">escríbenos</a> y te avisamos cuando llegue.</p>'],
    ['¿Cuánto cuesta usar Fixer?', '<p>Buscar y contactar técnicos es gratis. Pagas la tarifa del servicio que define cada técnico, y la ves antes de contratar. Los detalles de comisiones se publicarán antes de abrir el cobro en la app.</p>'],
    ['¿Tengo que descargar algo de una tienda?', '<p>No. Fixer funciona desde el navegador de tu teléfono y puedes instalarla en la pantalla de inicio en menos de un minuto. <a href="descargar.html">Mira cómo.</a></p>']
  ],
  Pagos: [
    ['¿Cómo funciona el pago en custodia?', '<p>Al contratar, tu pago queda retenido. El técnico trabaja con la tranquilidad de que el pago existe, y tú tienes la seguridad de que no se libera hasta que lo apruebes con el código de cierre.</p>'],
    ['¿Qué es el código de cierre?', '<p>Es un código de cuatro dígitos que el técnico te da cuando termina el trabajo. Al ingresarlo en la app, confirmas que todo está en orden y el pago se libera. Sin ese código, el dinero no se mueve.</p>'],
    ['¿En qué moneda se paga?', '<p>Las tarifas se muestran en dólares, con su equivalente en bolívares calculado con la tasa oficial del BCV. La tasa se actualiza automáticamente.</p>'],
    ['¿Ya funciona el pago en custodia?', '<p>El cobro se habilita por etapas. La app te avisa cuando una función de pago esté disponible en tu zona, y los métodos aceptados se anunciarán en ese momento.</p>'],
    ['¿Qué pasa si el técnico no acepta mi solicitud?', '<p>Si el técnico rechaza la solicitud, no se te cobra nada y puedes elegir a otro. Si tienes un problema con un trabajo, escríbenos desde el chat de soporte dentro de la app.</p>']
  ],
  Técnicos: [
    ['¿Cómo me verifico como técnico?', '<p>Creas tu cuenta, completas tu perfil (oficio, experiencia y tarifa) y subes una foto de tu cédula o RIF y una selfie. Nuestro equipo revisa esos documentos y, si todo está en orden, tu perfil pasa a «Verificado».</p>'],
    ['¿Quién ve mis documentos?', '<p>Solo tú y el equipo que verifica técnicos. Los clientes nunca ven tu cédula ni tus fotos; solo ven tu nombre, zona, rubros, tarifa y si estás verificado.</p>'],
    ['¿Cuándo cobro mis trabajos?', '<p>Cuando tu cliente ingresa el código de cierre que le das al terminar. Los plazos y la forma de recibir el dinero se anunciarán antes de abrir el cobro en la app.</p>']
  ],
  'Cuenta y privacidad': [
    ['¿Qué datos guardan de mí?', '<p>Lo mínimo para funcionar: nombre, correo y, en el caso de técnicos, teléfono, cédula o RIF y fotos de verificación. No vendemos tus datos. Lee la <a href="legal.html#priv">política de privacidad</a> completa.</p>'],
    ['¿Cómo elimino mi cuenta?', '<p>Desde la app: Perfil → Eliminar cuenta. Se borran tu perfil, tus documentos y tus solicitudes como cliente.</p>'],
    ['¿Tienen soporte humano?', '<p>Sí. Dentro de la app hay un chat de soporte atendido por personas del equipo. También puedes escribirnos desde la <a href="contacto.html">página de contacto</a>.</p>']
  ]
};

/* ---------- Piezas ---------- */
const faqBlock = (pairs, open = false) => pairs.map(([q, a], i) => `<details${open && i === 0 ? ' open' : ''}><summary>${q}</summary><div class="ans">${a}</div></details>`).join('');

const PHONE = `
<div class="phone-stage">
  <div class="chip-float chip-a"><span class="ico">${ic('badge')}</span><div>Técnico verificado<small>Cédula y selfie revisadas</small></div></div>
  <div class="phone" aria-hidden="true">
    <div class="screen" data-demo>
      <div class="scr-head">
        <div class="scr-top"><span>Fixer</span><span class="scr-pill" data-bcv>BCV Bs. 888,89</span></div>
        <div class="scr-hi">Hola, Marta</div>
        <div class="scr-sub">¿Qué necesitas resolver hoy?</div>
        <div class="scr-search">${ic('search')} Busca tu servicio: Plomería…</div>
      </div>
      <div class="scr-rubros">
        <div><span style="color:#0ea5e9">${ic('drop')}</span>Plomería</div>
        <div><span style="color:#f5b301">${ic('zap')}</span>Electricista</div>
        <div><span style="color:#38bdf8">${ic('snow')}</span>Refrigeración</div>
        <div><span style="color:#fb923c">${ic('wrench')}</span>Mecánico</div>
      </div>
      <div class="scr-card">
        <div class="scr-av">LH</div>
        <div><b>Luis H. ${ic('badge')}</b><small>Plomero · cerca de ti</small><div class="tags"><span>Verificado</span><span class="pro">Super Pro</span></div></div>
        <div class="price">$40.00<small data-bs-of="40">≈ Bs. 35.556</small></div>
      </div>
      <div class="scr-nav"><span class="on">${ic('home')}</span><span>${ic('wrench')}</span><span>${ic('inbox')}</span><span>${ic('headset')}</span><span>${ic('user')}</span></div>
      <div class="sheet-demo">
        <h4>Código de cierre</h4>
        <p>Pídele el código a Luis cuando termine el trabajo.</p>
        <div class="code-boxes"><i></i><i></i><i></i><i></i></div>
        <div class="release">Liberar pago</div>
      </div>
    </div>
  </div>
  <div class="chip-float chip-b amber"><span class="ico">${ic('shieldOk')}</span><div>Pago protegido<small>$40.00 en custodia</small></div></div>
</div>`;

const shell = ({ file, title, desc, body, scripts = '', head = '' }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#06172b">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fixer">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:locale" content="es_VE">
<link rel="icon" type="image/png" href="../icon-192.png">
<link rel="apple-touch-icon" href="../icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script>document.documentElement.classList.add('js')</script>
${head}
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="index.html" aria-label="Fixer, ir al inicio"><img class="brand-mark" src="../icon-192.png" alt="" width="38" height="38"><span class="brand-word">Fixer</span></a>
    <nav class="nav-links" aria-label="Principal">${NAV.map(([h, t]) => `<a href="${h}"${h === file ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <a class="btn btn-amber btn-sm nav-cta" href="../">Abrir la app ${ic('arrow', 'go')}</a>
    <button class="menu-btn" aria-label="Abrir el menú" aria-expanded="false">${ic('menu')}</button>
  </div>
</header>
<div class="drawer" role="dialog" aria-label="Menú">
  <div class="drawer-top"><a class="brand" href="index.html"><img class="brand-mark" src="../icon-192.png" alt="" width="38" height="38"><span class="brand-word">Fixer</span></a><button class="menu-btn drawer-close" style="display:grid;margin-left:0" aria-label="Cerrar el menú">${ic('x')}</button></div>
  ${NAV.map(([h, t]) => `<a class="dl" href="${h}"${h === file ? ' aria-current="page"' : ''}>${t}${ic('arrow')}</a>`).join('')}
  <a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a>
</div>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="index.html"><img class="brand-mark" src="../icon-192.png" alt="" width="38" height="38"><span class="brand-word">Fixer</span></a>
        <p>Técnicos de confianza y pago protegido.</p>
      </div>
      <div><h4>Producto</h4><ul><li><a href="como-funciona.html">Cómo funciona</a></li><li><a href="tecnicos.html">Para técnicos</a></li><li><a href="descargar.html">Descargar</a></li><li><a href="../">Abrir la app</a></li></ul></div>
      <div><h4>Ayuda</h4><ul><li><a href="como-funciona.html#faq">Preguntas frecuentes</a></li><li><a href="contacto.html">Contacto</a></li></ul></div>
      <div><h4>Legal</h4><ul><li><a href="legal.html#terms">Términos y condiciones</a></li><li><a href="legal.html#priv">Política de privacidad</a></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© <span id="year">2026</span> Fixer. Todos los derechos reservados.</span></div>
  </div>
</footer>
${scripts}
<script src="assets/site.js"></script>
</body>
</html>
`;

const pageHero = (eyebrow, h1, lead, extra = '') => `
<section class="page-hero dark">
  <div class="wrap">
    <span class="eyebrow">${eyebrow}</span>
    <h1>${h1}</h1>
    <p class="lead">${lead}</p>
    ${extra}
  </div>
</section>`;

const ctaFinal = (h, p, btns) => `
<section class="section cta dark">
  <div class="wrap">
    <span class="eyebrow">Fixer</span>
    <h2 style="margin-top:18px">${h}</h2>
    <p>${p}</p>
    <div class="hero-cta">${btns}</div>
  </div>
</section>`;

/* ---------- Páginas ---------- */
const pages = {};

pages['index.html'] = shell({
  file: 'index.html',
  title: 'Fixer · Técnicos de confianza con pago protegido',
  desc: 'Encuentra técnicos verificados cerca de ti. Tu pago queda en custodia y solo se libera cuando ingresas el código de cierre.',
  body: `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="badge-live"><i></i>Tus técnicos cercanos</span>
      <h1>Paga cuando el trabajo <em>esté hecho.</em></h1>
      <p class="lead">Fixer te conecta con técnicos verificados de tu zona. Tu dinero queda en custodia y solo se libera cuando tú ingresas el código de cierre.</p>
      <div class="hero-cta">
        <a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a>
        <a class="btn btn-ghost" href="tecnicos.html">Soy técnico</a>
      </div>
      <div class="hero-proof">
        <span>${ic('badge')}Técnicos verificados</span>
        <span>${ic('shieldOk')}Pago en custodia</span>
        <span>${ic('wallet')}USD y Bs. a tasa BCV</span>
      </div>
    </div>
    ${PHONE}
  </div>
</section>

<div class="ticker" aria-label="Rubros disponibles"><div class="ticker-track">
  ${[0, 1].map(() => RUBROS.map((r) => `<span>${r[1]}</span>`).join('')).join('')}
</div></div>

<section class="section" id="como">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Así funciona</span><h2>Tres pasos y el trabajo queda resuelto.</h2><p class="lead">Sin llamadas a ciegas ni pagos por adelantado a alguien que no conoces.</p></div>
    <div class="steps">
      <article class="step reveal">
        <div class="step-n">1</div><h3>Busca</h3><p>Elige el rubro y compara técnicos cerca de ti: tarifa por visita, calificación y zona.</p>
        <div class="mini"><div class="row"><div class="bar">${ic('search')} Plomería cerca de mí</div></div><div class="chips"><span class="on">Verificados</span><span>Disponibles ahora</span><span>24 h</span></div></div>
      </article>
      <article class="step reveal" style="--d:.1s">
        <div class="step-n">2</div><h3>Contrata</h3><p>Cuéntale qué necesitas y paga en custodia. El técnico recibe la solicitud con tu pago ya respaldado.</p>
        <div class="mini"><div class="amt"><span>Visita de plomería</span><span>$40.00 <small data-bs-of="40">≈ Bs. 35.556</small></span></div><div class="pay">Pagar en custodia</div></div>
      </article>
      <article class="step reveal" style="--d:.2s">
        <div class="step-n">3</div><h3>Libera</h3><p>Cuando terminan, el técnico te da un código de cuatro dígitos. Al ingresarlo, el pago se libera.</p>
        <div class="mini"><div class="pins"><i>4</i><i>8</i><i>2</i><i>1</i></div><div class="amt"><small>Pago liberado</small><span>✓ Listo</span></div></div>
      </article>
    </div>
  </div>
</section>

<section class="section code-section dark" id="codigo">
  <div class="wrap code-grid">
    <div class="reveal">
      <span class="eyebrow">El código de cierre</span>
      <h2 style="margin-top:18px">Tú tienes la última palabra.</h2>
      <p class="lead" style="margin-top:22px">Un código de cuatro dígitos separa «el técnico llegó» de «el trabajo está hecho». Sin código, el dinero no se mueve.</p>
      <ul class="checks">
        <li>${ic('check')}<span><b>Pagas al contratar, no al terminar.</b> Tu dinero queda retenido mientras se hace el trabajo.</span></li>
        <li>${ic('check')}<span><b>El código lo tienes tú.</b> El técnico te lo da cuando termina y tú lo ingresas.</span></li>
        <li>${ic('check')}<span><b>Si el técnico no puede,</b> no se cobra nada y eliges a otro.</span></li>
      </ul>
    </div>
    <div class="pad reveal" id="pad" style="--d:.12s" aria-label="Demostración del código de cierre">
      <div class="pad-head"><div><b>Código de cierre</b><small>Solicitud de plomería · Luis H.</small></div><span class="pad-tag">Pruébalo</span></div>
      <div class="pad-display"><i></i><i></i><i></i><i></i></div>
      <div class="pad-status" aria-live="polite"></div>
      <div class="keys">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-k="${n}" aria-label="${n}">${n}</button>`).join('')}
        <button type="button" class="fn" data-k="del" aria-label="Borrar">Borrar</button>
        <button type="button" data-k="0" aria-label="0">0</button>
        <button type="button" class="fn" data-k="auto" aria-label="Autocompletar">Usar 4821</button>
      </div>
      <div class="pad-ok"><div class="big">${ic('check')}</div><b>¡Pago liberado!</b><p>$40.00 enviados a Luis H. El trabajo quedó cerrado.</p><button type="button" class="btn btn-ghost btn-sm" data-again>Volver a probar</button></div>
    </div>
  </div>
</section>

<section class="section" id="confianza">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Confianza</span><h2>Hecho para que no tengas que adivinar.</h2><p class="lead">Cada detalle de Fixer existe para que sepas con quién tratas y qué pasa con tu dinero.</p></div>
    <div class="bento">
      <div class="cell c-wide c-dark reveal">
        <span class="ico">${ic('shieldOk')}</span><h3>Pago en custodia</h3>
        <p>Tu dinero espera en el medio, protegido, hasta que el trabajo esté hecho y lo apruebes.</p>
        <div class="flow" aria-hidden="true">
          <div class="node">${ic('user')}Tú</div><div class="line"></div>
          <div class="node mid">${ic('lock')}Custodia</div><div class="line b"></div>
          <div class="node">${ic('wrench')}Técnico</div>
        </div>
      </div>
      <div class="cell c-wide reveal" style="--d:.08s">
        <span class="ico">${ic('badge')}</span><h3>Técnicos verificados</h3>
        <p>Antes de recibir solicitudes, cada técnico sube su cédula o RIF y una selfie. Una persona del equipo los revisa.</p>
        <ul class="checklist"><li>${ic('check')}Identidad revisada por el equipo</li><li>${ic('check')}Rubros, experiencia y tarifa a la vista</li><li>${ic('check')}Calificaciones de clientes anteriores</li></ul>
      </div>
      <div class="cell c-third c-dark reveal">
        <span class="ico">${ic('send')}</span><h3>Chat en cada solicitud</h3>
        <p>Acuerda dirección, horario y alcance sin salir de la app.</p>
        <div class="bubbles"><span>Hola, la fuga es bajo el lavaplatos.</span><span class="me">Perfecto, llego en 40 minutos.</span></div>
      </div>
      <div class="cell c-third c-amber reveal" style="--d:.08s">
        <span class="ico">${ic('wallet')}</span><h3>Dólares y bolívares</h3>
        <p>La tarifa en USD con su equivalente en Bs. a la tasa oficial del BCV, al día.</p>
        <div class="conv">
          <label for="cv-usd">Dólares (USD)</label><div class="field"><span>$</span><input id="cv-usd" inputmode="decimal" value="40" aria-label="Monto en dólares"></div>
          <label>Bolívares (Bs.)</label><div class="field" id="cv-bs">Bs. 0,00</div>
          <span class="rate" id="cv-rate"></span>
        </div>
      </div>
      <div class="cell c-third reveal" style="--d:.16s">
        <span class="ico">${ic('star')}</span><h3>Calificaciones reales</h3>
        <p>Después de cada trabajo calificas. Así los buenos técnicos se hacen ver y tú eliges mejor.</p>
        <div class="stars" aria-label="Cinco estrellas">${[1, 2, 3, 4, 5].map(() => ic('star')).join('')}</div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="rubros" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Rubros</span><h2>Para la casa, el negocio y el carro.</h2><p class="lead">Catorce oficios para empezar. Si no ves el tuyo, escríbenos: abrimos rubros según la demanda de la zona.</p></div>
    <div class="rubros">
      ${RUBROS.map((r, i) => `<div class="rubro reveal" style="--c:${r[3]};--d:${(i % 4) * 0.05}s"><span class="ico">${ic(r[2])}</span><b>${r[1]}</b><span>${r[4]}</span></div>`).join('')}
    </div>
  </div>
</section>

<section class="section" id="tecnicos">
  <div class="wrap">
    <div class="band reveal">
      <div>
        <span class="eyebrow" style="color:var(--mint)">Para técnicos</span>
        <h2 style="margin-top:18px">¿Tienes un oficio? Que te encuentren los clientes de tu zona.</h2>
        <p>Crea tu perfil, verifícate y recibe solicitudes cerca de ti. Tú pones la tarifa; el código de cierre respalda tu cobro.</p>
        <div class="hero-cta"><a class="btn btn-amber" href="tecnicos.html">Quiero unirme ${ic('arrow', 'go')}</a></div>
      </div>
      <ul class="band-list">
        <li>${ic('inbox')}Recibe solicitudes de tu zona</li>
        <li>${ic('wallet')}Tú defines tu tarifa por visita</li>
        <li>${ic('lock')}Cobro respaldado por el código de cierre</li>
        <li>${ic('star')}Construye tu reputación con calificaciones</li>
      </ul>
    </div>
  </div>
</section>

<section class="section" id="faq-corto" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">Preguntas frecuentes</span><h2>Lo que más nos preguntan.</h2></div>
    <div class="faq reveal">${faqBlock([FAQ.General[0], FAQ.Pagos[0], FAQ.Pagos[1], FAQ.Pagos[3], FAQ.General[3]])}</div>
    <p style="text-align:center;margin-top:30px"><a class="btn btn-line" href="como-funciona.html#faq">Ver todas las preguntas ${ic('arrow', 'go')}</a></p>
  </div>
</section>

${ctaFinal('Abre Fixer y encuentra a tu técnico.', 'Funciona desde el navegador de tu teléfono y se instala en la pantalla de inicio en menos de un minuto.', `<a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="descargar.html">Cómo instalarla</a>`)}
`
});

pages['como-funciona.html'] = shell({
  file: 'como-funciona.html',
  title: 'Cómo funciona Fixer · Pago en custodia y código de cierre',
  desc: 'Conoce paso a paso cómo contratas a un técnico en Fixer, cómo funciona el pago en custodia y qué es el código de cierre.',
  body: `
${pageHero('Cómo funciona', 'Del «lo necesito» al «está resuelto», <em>sin dudas.</em>', 'Un recorrido claro, de la búsqueda al pago. Cada paso tiene una razón: que sepas con quién tratas y qué pasa con tu dinero.')}

<section class="section">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">Para clientes</span><h2>Seis pasos, de principio a fin.</h2></div>
    <div class="timeline">
      ${[
        ['Busca tu técnico', 'Entra a la app, elige el rubro y mira quién está cerca. Cada perfil muestra tarifa por visita, zona, calificación y si está verificado.', 'Tú decides'],
        ['Describe lo que necesitas', 'Escribe el problema con tus palabras. Desde ese momento tienes un chat con el técnico para acordar dirección, horario y alcance.', 'Chat incluido'],
        ['Paga en custodia', 'Ves la tarifa en dólares con su equivalente en bolívares a tasa BCV. Al contratar, el pago queda retenido: todavía no llega al técnico.', 'Dinero protegido'],
        ['El técnico acepta y trabaja', 'Si acepta, te avisamos y puede ir a tu casa o negocio. Si rechaza, no se te cobra nada y eliges a otro.', 'Avisos en la app'],
        ['Revisas el trabajo', 'Cuando termina, el técnico te da un código de cuatro dígitos. Tómate un momento para verificar que todo quedó bien.', 'Sin prisa'],
        ['Liberas el pago y calificas', 'Ingresa el código en la app y el pago se libera. Después califica al técnico: tu opinión ayuda a los próximos clientes.', 'Trabajo cerrado']
      ].map((s, i) => `<div class="tl-item reveal"><div class="tl-n">0${i + 1}</div><div><h3>${s[0]}</h3><p>${s[1]}</p><span class="tag">${s[2]}</span></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">El camino del dinero</span><h2>Tu pago nunca viaja a ciegas.</h2><p class="lead">El pago pasa por una etapa intermedia donde espera a que tú confirmes el trabajo.</p></div>
    <div class="diagram reveal">
      <div class="flow" aria-hidden="true">
        <div class="node">${ic('user')}Tú</div><div class="line"></div>
        <div class="node mid">${ic('lock')}Custodia</div><div class="line b"></div>
        <div class="node">${ic('wrench')}Técnico</div>
      </div>
      <div class="legend">
        <div><b>1 · Al contratar</b><p>Tu pago queda retenido. El técnico ve que el dinero existe.</p></div>
        <div><b>2 · Mientras trabaja</b><p>El dinero sigue en custodia. Nadie puede tocarlo.</p></div>
        <div><b>3 · Al terminar</b><p>Tú ingresas el código de cierre y el pago se libera al técnico.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section dark" style="background:var(--navy)">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Seguridad y confianza</span><h2 style="color:#fff">Quién eres y qué compartes, bajo control.</h2></div>
    <div class="cards3">
      <div class="card reveal" style="background:#0f2f52;border-color:#1d4a78;color:#fff"><span class="ico" style="background:rgba(143,240,226,.14);color:var(--mint)">${ic('idcard')}</span><h3>Identidad verificada</h3><p style="color:var(--on-dark-muted)">Los técnicos suben su cédula o RIF y una selfie. El equipo los revisa antes de que reciban solicitudes.</p></div>
      <div class="card reveal" style="--d:.08s;background:#0f2f52;border-color:#1d4a78;color:#fff"><span class="ico" style="background:rgba(143,240,226,.14);color:var(--mint)">${ic('lock')}</span><h3>Datos protegidos</h3><p style="color:var(--on-dark-muted)">Cada persona ve solo lo que le corresponde. Los documentos solo los ve el equipo de verificación.</p></div>
      <div class="card reveal" style="--d:.16s;background:#0f2f52;border-color:#1d4a78;color:#fff"><span class="ico" style="background:rgba(143,240,226,.14);color:var(--mint)">${ic('headset')}</span><h3>Soporte humano</h3><p style="color:var(--on-dark-muted)">Un chat dentro de la app, atendido por personas, para cuando algo no sale como esperabas.</p></div>
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">Preguntas frecuentes</span><h2>Todo lo que quieres saber.</h2><p class="lead">Si no encuentras tu respuesta, <a href="contacto.html" style="color:var(--teal-2);font-weight:700">escríbenos</a>.</p></div>
    ${Object.entries(FAQ).map(([g, qs], i) => `<div class="faq-group" ${i === 0 ? 'style="margin-top:0"' : ''}><div class="faq"><h3 style="margin-bottom:6px">${g}</h3>${faqBlock(qs)}</div></div>`).join('')}
  </div>
</section>

${ctaFinal('Listo para probarlo.', 'Abre la app y busca a tu primer técnico. Es gratis buscar y contactar.', `<a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="descargar.html">Instalar en mi teléfono</a>`)}
`
});

pages['tecnicos.html'] = shell({
  file: 'tecnicos.html',
  title: 'Para técnicos · Únete a Fixer y recibe clientes en tu zona',
  desc: 'Crea tu perfil en Fixer, verifícate y recibe solicitudes de clientes cerca de ti. Tú pones tu tarifa y cobras con el código de cierre.',
  body: `
${pageHero('Para técnicos', 'Tu oficio, más cerca de <em>quien te necesita.</em>', 'Fixer te pone frente a clientes de tu zona que ya saben qué necesitan y tienen su pago respaldado. Tú haces el trabajo; la plataforma hace el resto.', `<div class="hero-cta"><a class="btn btn-amber" href="../">Crear mi perfil ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="#pasos">Ver cómo empezar</a></div>`)}

<section class="section">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Lo que ganas</span><h2>Menos buscar clientes, más trabajar.</h2></div>
    <div class="cards3">
      ${[
        ['inbox', 'Solicitudes de tu zona', 'Los clientes te encuentran por tu rubro y cercanía. Aceptas las que te convienen.'],
        ['wallet', 'Tu tarifa, tu decisión', 'Tú defines el precio por visita. El cliente lo ve antes de contratarte.'],
        ['lock', 'Cobro respaldado', 'El pago ya está en custodia cuando recibes la solicitud. Se libera con el código de cierre.'],
        ['send', 'Chat con el cliente', 'Acuerda dirección, horario y alcance sin dar tu número a desconocidos.'],
        ['star', 'Reputación visible', 'Cada trabajo bien hecho suma calificaciones que te ayudan a recibir más clientes.'],
        ['clock', 'Disponible cuando tú quieras', 'Un interruptor te pone disponible o no. Tú manejas tu tiempo.']
      ].map((c, i) => `<div class="card reveal" style="--d:${(i % 3) * 0.08}s"><span class="ico">${ic(c[0])}</span><h3>${c[1]}</h3><p>${c[2]}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section" id="pasos" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">Cómo empezar</span><h2>De tu registro a tu primera solicitud.</h2></div>
    <div class="timeline">
      ${[
        ['Crea tu cuenta', 'Entra a la app, elige «Soy técnico» y regístrate con tu correo o con Google.', 'Gratis'],
        ['Cuéntanos de tu oficio', 'Tu nombre, teléfono, ciudad y zona, los rubros en los que trabajas, tu experiencia y tu tarifa por visita.', 'Paso a paso'],
        ['Sube tus documentos', 'Una foto de tu cédula o RIF y una selfie. Si tienes un certificado o referencia, súbelo también.', 'Solo los ve el equipo'],
        ['Te verificamos', 'Una persona del equipo revisa tus datos. Cuando todo está en orden, tu perfil pasa a «Verificado».', 'Revisión humana'],
        ['Recibe solicitudes', 'Te avisamos cuando alguien te contrate. Aceptas, trabajas, entregas el código de cierre y cobras.', 'A trabajar']
      ].map((s, i) => `<div class="tl-item reveal"><div class="tl-n">0${i + 1}</div><div><h3>${s[0]}</h3><p>${s[1]}</p><span class="tag">${s[2]}</span></div></div>`).join('')}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap split">
    <div class="reveal"><span class="eyebrow">Requisitos</span><h2 style="margin-top:18px">Lo que necesitas para registrarte.</h2><p class="lead" style="margin-top:20px">Pedimos poco, pero lo pedimos bien: así los clientes confían en cada técnico de la plataforma.</p></div>
    <ul class="reqs reveal" style="--d:.1s">
      <li>${ic('user')}<div>Ser mayor de 18 años<span>Con un oficio o servicio que ofrecer.</span></div></li>
      <li>${ic('idcard')}<div>Cédula o RIF vigente<span>Una foto clara, por ambos lados si aplica.</span></div></li>
      <li>${ic('camera')}<div>Una selfie reciente<span>Para confirmar que eres quien dices ser.</span></div></li>
      <li>${ic('phone')}<div>Teléfono o WhatsApp activo<span>Para que podamos contactarte.</span></div></li>
      <li>${ic('pin')}<div>Tu zona de trabajo<span>Para mostrarte las solicitudes cercanas.</span></div></li>
    </ul>
  </div>
</section>

<section class="section" id="faq" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">Preguntas de técnicos</span><h2>Antes de registrarte.</h2></div>
    <div class="faq reveal">${faqBlock(FAQ['Técnicos'].concat([FAQ.Pagos[1], FAQ.General[2]]))}</div>
  </div>
</section>

${ctaFinal('Empieza hoy tu registro.', 'Crear tu perfil toma unos minutos. Cuando te verifiquemos, empiezas a recibir solicitudes.', `<a class="btn btn-amber" href="../">Crear mi perfil ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="contacto.html">Tengo una pregunta</a>`)}
`
});

pages['descargar.html'] = shell({
  file: 'descargar.html',
  title: 'Descargar Fixer · Instálala en tu teléfono en un minuto',
  desc: 'Fixer funciona desde el navegador y se instala en la pantalla de inicio de tu iPhone, Android o computadora. Sin tiendas, sin esperas.',
  scripts: '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>',
  body: `
<section class="page-hero dark">
  <div class="wrap split">
    <div>
      <span class="eyebrow">Descargar</span>
      <h1>Fixer en tu teléfono, <em>en un minuto.</em></h1>
      <p class="lead">No necesitas una tienda de aplicaciones. Abre Fixer en tu navegador, agrégala a la pantalla de inicio y úsala como cualquier app, a pantalla completa.</p>
      <div class="hero-cta"><a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="#instalar">Ver cómo instalarla</a></div>
    </div>
    <div class="qr-card" style="justify-self:center;max-width:380px;width:100%">
      <b style="font:700 1.2rem var(--f-display);color:var(--text)">Escanea y abre Fixer</b>
      <div class="qr-box" data-qr></div>
      <span style="color:var(--muted);font-size:.92rem;overflow-wrap:anywhere" data-app-url></span>
      <div class="stores">
        <div class="store">${ic('apple')}<div><small>Descárgala en</small><b>App Store</b></div><span class="soon">Próximamente</span></div>
        <div class="store">${ic('play')}<div><small>Disponible en</small><b>Google Play</b></div><span class="soon">Próximamente</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="instalar">
  <div class="wrap">
    <div class="sec-head reveal"><span class="eyebrow">Instalación</span><h2>Elige tu dispositivo.</h2><p class="lead">Son cuatro pasos y no ocupa espacio como una app pesada. Se actualiza sola.</p></div>
    <div class="tabs" role="tablist" aria-label="Dispositivo">
      <button role="tab" id="t-iphone" data-os="iphone" aria-controls="p-iphone" aria-selected="true">iPhone</button>
      <button role="tab" id="t-android" data-os="android" aria-controls="p-android" aria-selected="false">Android</button>
      <button role="tab" id="t-pc" data-os="pc" aria-controls="p-pc" aria-selected="false">Computadora</button>
    </div>
    <div class="tab-panel" id="p-iphone" role="tabpanel" aria-labelledby="t-iphone">
      <ol class="install">
        <li><div><b>Abre Fixer en Safari</b><p>Usa el navegador Safari. En otros navegadores de iPhone la opción de instalar puede no aparecer.</p></div></li>
        <li><div><b>Toca el botón Compartir</b><p>Es el cuadro con la flecha hacia arriba <span class="kbd">${ic('share')} Compartir</span> en la barra inferior.</p></div></li>
        <li><div><b>Elige «Agregar a pantalla de inicio»</b><p>Desliza el menú hacia abajo si no la ves. Puedes dejar el nombre «Fixer».</p></div></li>
        <li><div><b>Toca «Agregar»</b><p>Listo: Fixer queda con su ícono y se abre a pantalla completa.</p></div></li>
      </ol>
    </div>
    <div class="tab-panel" id="p-android" role="tabpanel" aria-labelledby="t-android" hidden>
      <ol class="install">
        <li><div><b>Abre Fixer en Chrome</b><p>Entra al enlace desde Google Chrome.</p></div></li>
        <li><div><b>Abre el menú</b><p>Toca los tres puntos <span class="kbd">${ic('dots')} Menú</span> arriba a la derecha.</p></div></li>
        <li><div><b>Elige «Instalar app»</b><p>En algunos teléfonos dice «Agregar a la pantalla principal».</p></div></li>
        <li><div><b>Confirma</b><p>Fixer aparece junto a tus demás apps y se abre sin la barra del navegador.</p></div></li>
      </ol>
    </div>
    <div class="tab-panel" id="p-pc" role="tabpanel" aria-labelledby="t-pc" hidden>
      <ol class="install">
        <li><div><b>Abre Fixer en Chrome o Edge</b><p>Entra al enlace desde tu computadora.</p></div></li>
        <li><div><b>Busca el ícono de instalar</b><p>Aparece a la derecha de la barra de direcciones <span class="kbd">${ic('plus')} Instalar</span>.</p></div></li>
        <li><div><b>Pulsa «Instalar»</b><p>Fixer se abre en su propia ventana, como un programa más.</p></div></li>
        <li><div><b>Fíjala si quieres</b><p>Puedes anclarla a la barra de tareas o al dock.</p></div></li>
      </ol>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head center reveal"><span class="eyebrow">¿Por qué sin tienda?</span><h2>Más simple para ti.</h2></div>
    <div class="cards3">
      <div class="card reveal"><span class="ico">${ic('zap')}</span><h3>Siempre al día</h3><p>Cada mejora llega sola. No hay actualizaciones que instalar ni versiones viejas.</p></div>
      <div class="card reveal" style="--d:.08s"><span class="ico">${ic('home')}</span><h3>Ligera</h3><p>No ocupa el espacio de una app tradicional, y abre rápido incluso con conexión limitada.</p></div>
      <div class="card reveal" style="--d:.16s"><span class="ico">${ic('user')}</span><h3>Una sola cuenta</h3><p>Entra con tu correo desde cualquier dispositivo y encuentra tus solicitudes donde las dejaste.</p></div>
    </div>
  </div>
</section>

${ctaFinal('Tu técnico está a un toque.', 'Abre Fixer, crea tu cuenta y encuentra quién te ayude hoy.', `<a class="btn btn-amber" href="../">Abrir la app ${ic('arrow', 'go')}</a><a class="btn btn-ghost" href="como-funciona.html">Cómo funciona</a>`)}
`
});

pages['contacto.html'] = shell({
  file: 'contacto.html',
  title: 'Contacto · Escríbenos a Fixer',
  desc: 'Escríbenos tus preguntas, ideas o propuestas de alianza. También puedes usar el chat de soporte dentro de la app.',
  head: '',
  scripts: `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="../firebase-config.js"></script>
<script src="assets/site-config.js"></script>`,
  body: `
${pageHero('Contacto', 'Hablemos. Te <em>respondemos.</em>', 'Cuéntanos qué necesitas: dudas, ideas, alianzas o si quieres que Fixer llegue a tu zona.')}

<section class="section">
  <div class="wrap contact-grid">
    <form class="form reveal" id="contact-form" novalidate>
      <div class="two">
        <div class="fld"><label for="nombre">Tu nombre</label><input id="nombre" name="nombre" autocomplete="name" maxlength="80" required placeholder="María Pérez"></div>
        <div class="fld"><label for="correo">Tu correo</label><input id="correo" name="correo" type="email" autocomplete="email" maxlength="120" required placeholder="tu@correo.com"></div>
      </div>
      <div class="fld"><label for="tema">¿Sobre qué quieres hablar?</label>
        <select id="tema" name="tema">
          <option>Quiero usar Fixer</option>
          <option>Soy técnico y quiero unirme</option>
          <option>Quiero que Fixer llegue a mi zona</option>
          <option>Alianzas y empresas</option>
          <option>Ayuda con mi cuenta</option>
          <option>Otro tema</option>
        </select>
      </div>
      <div class="fld"><label for="mensaje">Tu mensaje</label><textarea id="mensaje" name="mensaje" maxlength="1000" required placeholder="Cuéntanos con calma…"></textarea><span class="hint">0 / 1000</span></div>
      <div class="hp" aria-hidden="true"><label for="empresa">No llenes este campo</label><input id="empresa" name="empresa" tabindex="-1" autocomplete="off"></div>
      <div class="form-msg" role="status" hidden></div>
      <button class="btn btn-navy" type="submit">Enviar mensaje ${ic('send')}</button>
      <p style="font-size:.85rem;color:var(--muted)">Usaremos tus datos solo para responderte. Lee la <a href="legal.html#priv" style="color:var(--teal-2);font-weight:700">política de privacidad</a>.</p>
    </form>
    <div style="display:grid;gap:18px" class="reveal">
      <div class="channels" id="channels"></div>
      <div class="note-box">${ic('headset')}<div><b>¿Ya usas la app y algo no salió bien?</b><p>Usa el chat de soporte dentro de Fixer: lo atiende el equipo y tiene el contexto de tu solicitud, así te ayudamos más rápido.</p></div></div>
    </div>
  </div>
</section>
`
});

pages['legal.html'] = shell({
  file: 'legal.html',
  title: 'Legal · Términos y condiciones y política de privacidad de Fixer',
  desc: 'Términos y condiciones de uso y política de privacidad de Fixer.',
  scripts: '<script src="assets/legal.js"></script>',
  body: `
${pageHero('Legal', 'Las reglas del juego, <em>claras.</em>', 'Qué esperamos de ti, qué puedes esperar de nosotros y cómo cuidamos tus datos.')}
<section class="section">
  <div class="wrap legal-wrap">
    <div class="legal-nav" role="tablist" aria-label="Documentos">
      <button type="button" data-doc="terms" aria-selected="true">Términos y condiciones</button>
      <button type="button" data-doc="priv" aria-selected="false">Política de privacidad</button>
    </div>
    <article class="legal-doc" id="legal-doc" aria-live="polite"></article>
  </div>
</section>
`
});

/* ---------- Archivos de apoyo ---------- */
const fuenteApp = readFileSync(new URL('index.html', RAIZ), 'utf8');
const ini = fuenteApp.indexOf('var LEGAL_VERSION');
const fin = fuenteApp.indexOf('/* ---------- Avisos');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fuenteApp.slice(ini, fin) + '\nthis.out = { version: LEGAL_VERSION, cfg: LEGAL_CFG, docs: LEGAL };', ctx);
writeFileSync(new URL('assets/legal.js', SALIDA), 'window.FIXER_LEGAL = ' + JSON.stringify(ctx.out, null, 1) + ';\n');

const iconos = {};
for (const n of ['phone', 'mail', 'camera']) iconos[n] = ic(n);
writeFileSync(new URL('assets/icons.js', SALIDA), 'window.FIXER_ICONS = ' + JSON.stringify(iconos) + ';\n');

for (const [archivo, html] of Object.entries(pages)) {
  const conIconos = archivo === 'contacto.html' ? html.replace('<script src="assets/site.js">', '<script src="assets/icons.js"></script>\n<script src="assets/site.js">') : html;
  writeFileSync(new URL(archivo, SALIDA), conIconos);
}
console.log('Sitio generado:', Object.keys(pages).join(', '));
