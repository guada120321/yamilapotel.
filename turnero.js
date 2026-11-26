'use strict';

/* =========================================================
   TURNERO — Diagnóstico Inicial
   ---------------------------------------------------------
   Selección de día y horario dentro del cuestionario.
   Se muestra en el último paso (después de las 6 preguntas).

   Reglas:
   - Días: lunes a viernes (fines de semana no se muestran).
   - Horarios: turnos de 1 hora, de 8 a 12 y de 13 a 17.
   - No se pueden elegir fechas pasadas.
   - Se pueden consultar hasta 8 semanas hacia adelante.

   La elección se expone en window.YPTurnero para que
   js/diagnostico.js la agregue al mensaje de WhatsApp y al
   payload que recibe el backend (GAS).
   ========================================================= */

// API por defecto: si por algo no está el turnero en la página,
// el formulario de contacto sigue funcionando igual.
window.YPTurnero = {
  obtener: function () {
    return { turno_fecha: '', turno_horario: '' };
  },
  incompleto: function () {
    return false;
  },
  mostrarError: function () {}
};

(function () {

  var root = document.getElementById('turnero');

  if (!root) {
    return;
  }

  var DIAS_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  var DIAS_LARGO = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
  var MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Cada turno dura una hora: se muestra el rango completo.
  var TURNOS_MANIANA = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00'
  ];
  var TURNOS_TARDE = [
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  var MAX_SEMANAS = 8;

  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Lunes de la semana en curso: la grilla siempre arranca en lunes.
  var lunesBase = new Date(hoy);
  lunesBase.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  lunesBase.setHours(0, 0, 0, 0);

  var semanaOffset = 0;
  var fechaSeleccionada = ''; // ISO local: yyyy-mm-dd
  var horaSeleccionada = '';  // Ej.: "10:00 - 11:00"

  var dias = document.getElementById('turnero-dias');
  var horarios = document.getElementById('turnero-horarios');
  var horasManiana = document.getElementById('turnero-horas-maniana');
  var horasTarde = document.getElementById('turnero-horas-tarde');
  var hint = document.getElementById('turnero-hint');
  var resumen = document.getElementById('turnero-resumen');
  var limpiarBoton = document.getElementById('turnero-limpiar');
  var error = document.getElementById('turnero-error');
  var semanaLabel = document.getElementById('turnero-semana-label');
  var anterior = document.getElementById('turnero-semana-anterior');
  var siguiente = document.getElementById('turnero-semana-siguiente');
  var fechaInput = document.getElementById('turno_fecha');
  var horaInput = document.getElementById('turno_horario');

  if (!dias || !horarios || !horasManiana || !horasTarde || !hint ||
      !resumen || !limpiarBoton || !error || !semanaLabel ||
      !anterior || !siguiente || !fechaInput || !horaInput) {
    return;
  }

  function slice(list) {
    return Array.prototype.slice.call(list);
  }

  function dosDigitos(numero) {
    return numero < 10 ? '0' + numero : String(numero);
  }

  function aIso(fecha) {
    return fecha.getFullYear() + '-' +
      dosDigitos(fecha.getMonth() + 1) + '-' +
      dosDigitos(fecha.getDate());
  }

  function desdeIso(texto) {
    var partes = String(texto).split('-');
    return new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );
  }

  function textoFecha(fecha) {
    var dia = (fecha.getDay() + 6) % 7;

    return DIAS_LARGO[dia] + ' ' + fecha.getDate() + ' de ' +
      MESES_LARGO[fecha.getMonth()] + ' de ' + fecha.getFullYear();
  }

  function inicioSemana(offset) {
    var fecha = new Date(lunesBase);
    fecha.setDate(lunesBase.getDate() + offset * 7);
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  function lunesDe(fecha) {
    var copia = new Date(fecha);
    copia.setDate(copia.getDate() - ((copia.getDay() + 6) % 7));
    copia.setHours(0, 0, 0, 0);
    return copia;
  }

  function etiquetaSemana(offset) {
    var inicio = inicioSemana(offset);
    var fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 4);

    if (inicio.getMonth() === fin.getMonth()) {
      return inicio.getDate() + ' al ' + fin.getDate() + ' de ' +
        MESES_LARGO[fin.getMonth()] + ' de ' + fin.getFullYear();
    }

    return inicio.getDate() + ' de ' + MESES_LARGO[inicio.getMonth()] +
      ' al ' + fin.getDate() + ' de ' + MESES_LARGO[fin.getMonth()] +
      ' de ' + fin.getFullYear();
  }

  /* -------------------------------------------------------
     Botones
     ------------------------------------------------------- */

  function crearBotonDia(fecha) {
    var iso = aIso(fecha);
    var boton = document.createElement('button');
    var nombre;
    var numero;
    var mes;

    boton.type = 'button';
    boton.className = 'turnero-dia';
    boton.setAttribute('data-fecha', iso);

    nombre = document.createElement('span');
    nombre.className = 'turnero-dia-nombre';
    nombre.textContent = DIAS_CORTO[(fecha.getDay() + 6) % 7];

    numero = document.createElement('span');
    numero.className = 'turnero-dia-numero';
    numero.textContent = String(fecha.getDate());

    mes = document.createElement('span');
    mes.className = 'turnero-dia-mes';
    mes.textContent = MESES_CORTO[fecha.getMonth()];

    boton.appendChild(nombre);
    boton.appendChild(numero);
    boton.appendChild(mes);

    if (fecha < hoy) {
      boton.disabled = true;
      boton.classList.add('is-disabled');
      boton.title = 'Fecha no disponible';
      boton.setAttribute('aria-label', textoFecha(fecha) + ' (no disponible)');
    } else {
      boton.setAttribute('aria-label', 'Elegir turno el ' + textoFecha(fecha));
      boton.addEventListener('click', function () {
        seleccionarDia(iso);
      });
    }

    return boton;
  }

  function crearBotonHora(rango) {
    var boton = document.createElement('button');
    var partes = rango.split(' - ');
    var inicio;
    var fin;

    boton.type = 'button';
    boton.className = 'turnero-hora';
    boton.setAttribute('data-hora', rango);
    boton.setAttribute('aria-pressed', 'false');
    boton.setAttribute('aria-label', 'Turno de ' + rango);

    inicio = document.createElement('span');
    inicio.className = 'turnero-hora-inicio';
    inicio.textContent = partes[0];

    fin = document.createElement('span');
    fin.className = 'turnero-hora-fin';
    fin.textContent = 'a ' + partes[1];

    boton.appendChild(inicio);
    boton.appendChild(fin);

    return boton;
  }

  function renderHoras() {
    TURNOS_MANIANA.forEach(function (rango) {
      horasManiana.appendChild(crearBotonHora(rango));
    });

    TURNOS_TARDE.forEach(function (rango) {
      horasTarde.appendChild(crearBotonHora(rango));
    });
  }

  /* -------------------------------------------------------
     Render
     ------------------------------------------------------- */

  function renderDias() {
    var inicio = inicioSemana(semanaOffset);
    var i;
    var fecha;

    dias.textContent = '';
    semanaLabel.textContent = etiquetaSemana(semanaOffset);

    for (i = 0; i < 5; i++) {
      fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      dias.appendChild(crearBotonDia(fecha));
    }

    slice(dias.querySelectorAll('.turnero-dia')).forEach(function (boton) {
      var seleccionado = boton.getAttribute('data-fecha') === fechaSeleccionada;

      boton.classList.toggle('is-selected', seleccionado);
      boton.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
    });

    anterior.disabled = semanaOffset === 0;
    siguiente.disabled = semanaOffset >= MAX_SEMANAS - 1;
  }

  function renderSeleccion() {
    var fechaTexto = fechaSeleccionada
      ? textoFecha(desdeIso(fechaSeleccionada))
      : '';
    var completa = Boolean(fechaTexto && horaSeleccionada);
    var fuerte;

    fechaInput.value = fechaTexto;
    horaInput.value = horaSeleccionada;

    resumen.textContent = '';
    resumen.hidden = !completa;

    if (completa) {
      fuerte = document.createElement('strong');
      fuerte.textContent = 'Turno elegido: ';
      resumen.appendChild(fuerte);
      resumen.appendChild(document.createTextNode(
        fechaTexto + ' · ' + horaSeleccionada + ' hs'
      ));
    }

    limpiarBoton.hidden = !(fechaSeleccionada || horaSeleccionada);
    hint.hidden = Boolean(fechaSeleccionada);
    horarios.hidden = !fechaSeleccionada;
    error.hidden = true;

    slice(horarios.querySelectorAll('.turnero-hora')).forEach(function (boton) {
      var seleccionado = boton.getAttribute('data-hora') === horaSeleccionada;

      boton.classList.toggle('is-selected', seleccionado);
      boton.setAttribute('aria-pressed', seleccionado ? 'true' : 'false');
    });
  }

  /* -------------------------------------------------------
     Acciones
     ------------------------------------------------------- */

  function seleccionarDia(iso) {
    if (fechaSeleccionada === iso) {
      return;
    }

    fechaSeleccionada = iso;
    horaSeleccionada = '';
    renderDias();
    renderSeleccion();
  }

  function seleccionarHora(rango) {
    if (!fechaSeleccionada) {
      hint.hidden = false;
      return;
    }

    horaSeleccionada = rango;
    renderSeleccion();
  }

  function quitarTurno() {
    fechaSeleccionada = '';
    horaSeleccionada = '';
    renderDias();
    renderSeleccion();
  }

  function cambiarSemana(delta) {
    var destino = Math.min(Math.max(semanaOffset + delta, 0), MAX_SEMANAS - 1);

    if (destino === semanaOffset) {
      return;
    }

    semanaOffset = destino;

    // Si el turno elegido queda fuera de la semana visible, se limpia
    // para no dejar una selección que no se puede ver.
    if (fechaSeleccionada) {
      var lunesElegido = aIso(lunesDe(desdeIso(fechaSeleccionada)));
      var lunesVisible = aIso(inicioSemana(semanaOffset));

      if (lunesElegido !== lunesVisible) {
        fechaSeleccionada = '';
        horaSeleccionada = '';
      }
    }

    renderDias();
    renderSeleccion();
  }

  /* -------------------------------------------------------
     Eventos
     ------------------------------------------------------- */

  anterior.addEventListener('click', function () {
    cambiarSemana(-1);
  });

  siguiente.addEventListener('click', function () {
    cambiarSemana(1);
  });

  horarios.addEventListener('click', function (event) {
    var objetivo = event.target;
    var boton = objetivo && objetivo.closest
      ? objetivo.closest('.turnero-hora')
      : null;

    if (boton && !boton.disabled) {
      seleccionarHora(boton.getAttribute('data-hora'));
    }
  });

  limpiarBoton.addEventListener('click', function () {
    var primerDia;

    quitarTurno();
    primerDia = dias.querySelector('.turnero-dia:not(.is-disabled)');

    if (primerDia) {
      primerDia.focus();
    }
  });

  /* -------------------------------------------------------
     API usada por js/contacto.js
     ------------------------------------------------------- */

  window.YPTurnero = {
    obtener: function () {
      return {
        turno_fecha: fechaSeleccionada
          ? textoFecha(desdeIso(fechaSeleccionada))
          : '',
        turno_horario: horaSeleccionada
      };
    },

    incompleto: function () {
      return Boolean(fechaSeleccionada) !== Boolean(horaSeleccionada);
    },

    mostrarError: function () {
      error.textContent = 'Elegí un horario para completar el turno.';
      error.hidden = false;

      if (fechaSeleccionada && !horaSeleccionada) {
        horarios.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        root.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  renderHoras();
  renderDias();
  renderSeleccion();

})();
