'use strict';

/* =========================================================
   HEADER ÚNICO DEL SITIO — Yamila Potel
   ---------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO DONDE SE EDITA LA BARRA DE
   NAVEGACIÓN. Las 6 páginas lo cargan con:

       <script src="js/header.js"></script>

   así que un cambio hecho acá aparece en todas las páginas.
   NO editar el header dentro de los .html (ya no está: se
   reemplazó por esa línea de script).

   Qué hace:
     1. Arma el HTML del header (logo, menú, botón rojo,
        hamburguesa).
     2. Resalta solo el link de la página actual
        (is-active + aria-current), según el archivo abierto.
     3. El botón rojo "Solicitar Relevamiento" (y el del
        menú móvil) lleva a diagnostico.html#formulario, o
        sea directo al cuestionario (Paso 1 de 6).
        El link del menú "Diagnóstico Inicial" sí lleva al
        inicio de la página de diagnóstico, como siempre.

   Importante: este script va AL PRINCIPIO del <body> y se
   carga sin "defer", para que el header exista antes de que
   app.js (que maneja el menú hamburguesa) se enganche.
   ========================================================= */

(function () {

  /* Pestaña del formulario: adonde llevan TODOS los botones
     rojos de tipo "relevamiento / cuestionario". */
  var URL_FORMULARIO = 'diagnostico.html#formulario';

  /* Menú principal, en orden visual. El href es el archivo
     que se usa para saber cuál está activo. */
  var PAGINAS = [
    { href: 'index.html',       etiqueta: 'Inicio' },
    { href: 'servicios.html',   etiqueta: 'Servicios' },
    { href: 'diagnostico.html', etiqueta: 'Diagnóstico Inicial' },
    { href: 'sobre-mi.html',    etiqueta: 'Sobre Mí' },
    { href: 'contacto.html',    etiqueta: 'Contacto' }
  ];

  /* Archivo de la página abierta ahora. Sirve para ponerle
     la clase is-active al link correspondiente. */
  function paginaActual() {
    var ruta = window.location.pathname || '';
    var archivo = ruta.split('/').pop() || '';

    try {
      archivo = decodeURIComponent(archivo);
    } catch (error) {
      // Si no se puede decodificar, seguimos con el texto crudo.
    }

    // Sin archivo (por ejemplo "/" o "/index") = inicio.
    if (!archivo || archivo.indexOf('.') === -1) {
      return 'index.html';
    }

    return archivo;
  }

  function armarItemsDeMenu() {
    var actual = paginaActual();
    var lineas = [];

    PAGINAS.forEach(function (pagina) {
      var activo = pagina.href === actual;

      lineas.push(
        '          <li><a class="site-nav-link' + (activo ? ' is-active' : '') + '"' +
        (activo ? ' aria-current="page"' : '') +
        ' href="' + pagina.href + '">' + pagina.etiqueta + '</a></li>'
      );
    });

    return lineas.join('\n');
  }

  function armarHeader() {
    return [
      '  <header class="site-header" id="site-header">',
      '    <div class="header-inner">',
      '',
      '      <!-- Logo de marca -->',
      '      <a class="brand" href="index.html" aria-label="Yamila Potel - Inicio">',
      '        <span class="brand-monogram" aria-hidden="true">YP</span>',
      '        <span class="brand-text">',
      '          <span class="brand-name">Yamila Potel</span>',
      '          <span class="brand-tagline">Asesoría Contable · Impositiva · Económica · Financiera v1</span>',
      '        </span>',
      '      </a>',
      '',
      '      <!-- Menú de navegación (drawer a pantalla completa en móvil) -->',
      '      <nav class="site-nav" id="site-nav" aria-label="Navegación principal">',
      '',
      '        <!-- Cabecera de marca interna: solo se ve en el menú móvil -->',
      '        <div class="nav-drawer-header">',
      '          <a class="brand-mobile-drawer" href="index.html" aria-label="Yamila Potel - Inicio">',
      '            <span class="brand-monogram" aria-hidden="true">YP</span>',
      '            <span class="brand-drawer-text">',
      '              <span class="brand-name">Yamila Potel</span>',
      '              <span class="brand-tagline">Asesoría Contable e Impositiva</span>',
      '            </span>',
      '          </a>',
      '        </div>',
      '',
      '        <button class="nav-close" id="nav-close" type="button" aria-label="Cerrar menú de navegación">',
      '          <span class="nav-close-icon" aria-hidden="true"></span>',
      '        </button>',
      '',
      '        <ul class="site-nav-list">',
      armarItemsDeMenu(),
      '        </ul>',
      '',
      '        <a class="btn btn-primary nav-mobile-cta" href="' + URL_FORMULARIO + '">Solicitar Relevamiento &rarr;</a>',
      '      </nav>',
      '',
      '      <!-- Botón CTA: baja directo al formulario (Paso 1 de 6) -->',
      '      <a class="btn btn-primary header-cta" href="' + URL_FORMULARIO + '">Solicitar Relevamiento &rarr;</a>',
      '',
      '      <!-- Menú hamburguesa (mobile) -->',
      '      <button',
      '        class="nav-toggle"',
      '        id="nav-toggle"',
      '        type="button"',
      '        aria-label="Abrir menú de navegación"',
      '        aria-controls="site-nav"',
      '        aria-expanded="false">',
      '        <span class="nav-toggle-bar"></span>',
      '        <span class="nav-toggle-bar"></span>',
      '        <span class="nav-toggle-bar"></span>',
      '      </button>',
      '',
      '    </div>',
      '  </header>'
    ].join('\n');
  }

  function insertarHeader() {
    var html = armarHeader();
    var miScript = document.currentScript;

    if (miScript && miScript.parentNode) {
      // Este <script> está al principio del <body>: el header
      // queda insertado justo antes, es decir, arriba de todo.
      miScript.insertAdjacentHTML('beforebegin', html);
      return;
    }

    // Respaldo por si document.currentScript no está disponible.
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  insertarHeader();

})();
