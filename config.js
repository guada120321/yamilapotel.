'use strict';

/* =========================================================
   CONFIGURACIÓN DEL BACKEND — Yamila Potel
   ---------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO HAY QUE TOCAR SI CAMBIA LA URL
   DE APPS SCRIPT.

   Si algún día se genera una implementación NUEVA en GAS:
     1. Copiar la nueva URL /exec acá abajo.
     2. Guardar el archivo. Listo.

   Si en GAS se hace "Editar implementación > Nueva versión",
   la URL NO cambia: no hay que hacer nada.

   Ojo: la copia de referencia de estos valores también está
   en Yamila-Potel/.env, pero el navegador NO lee ese archivo
   (el sitio es estático). El que manda es este de acá.
   ========================================================= */

// URL del web app de Apps Script (el backend).
// SIEMPRE termina en /exec.
var URL_GAS = 'https://script.google.com/macros/s/AKfycbxsj2Qrtopsq4TMDQ9E8rP7wNYb1xzFT9CAXCYJ5xT7Ep6Z_QQC9NBMKgDKeiO388af/exec';

// Link a la hoja "YP - Base de datos". Se usa en la
// notificación corta de WhatsApp del diagnóstico
// (cuando MODO_NOTIFICACION está en true).
var URL_PLANILLA = 'https://docs.google.com/spreadsheets/d/1ofj65k1OvKtpWQ-8qMKzClmg4DaJxi7UAkFOBv_EGB8/edit';
