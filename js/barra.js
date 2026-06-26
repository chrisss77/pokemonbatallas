/* eslint-env browser */
/* global lucide */

// Espera a que todo el contenido del DOM esté listo
window.addEventListener('DOMContentLoaded', () => {
  // Si la librería Lucide está cargada, genera los íconos automáticamente
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
});

// ======== 🔗 OBTENCIÓN DE ELEMENTOS ========
const themeLink = document.getElementById('theme-style');        // <link> principal del tema (barra)
const seccionLink = document.getElementById('seccion-style');    // <link> adicional para secciones (puede ser null)
const toggleBtn = document.getElementById('toggleModeBtn');      // Botón para alternar modo claro/oscuro

// ======== 🎨 MODO ACTUAL ========
let modoActual = 'claro'; // 'claro' o 'oscuro'

// ======== 🔘 ACTUALIZAR BOTÓN SEGÚN MODO ========
function updateButton() {
  if (!toggleBtn) return;

  if (modoActual === 'claro') {
    // En modo claro muestra "Modo oscuro"
    toggleBtn.textContent = 'Modo oscuro';
    toggleBtn.style.backgroundColor = '#108dbe';
    toggleBtn.style.color = 'white';

  } else {
    // En modo oscuro muestra "Modo claro"
    toggleBtn.textContent = 'Modo claro';
    toggleBtn.style.backgroundColor = 'white';
    toggleBtn.style.color = '#108dbe';
  }
}

// ======== 🌓 BOTÓN PRINCIPAL (CLARO / OSCURO) ========
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (modoActual === 'claro') {
      // Cambiar al modo oscuro
      if (themeLink) themeLink.href = '../CSS/modo-oscuro1.css';
      if (seccionLink) seccionLink.href = '../CSS/seccion-oscura.css';
      modoActual = 'oscuro';
    } else {
      // Volver al modo claro
      if (themeLink) themeLink.href = '../CSS/barra.css';
      if (seccionLink) seccionLink.href = ''; // desactiva estilos de secciones
      modoActual = 'claro';
    }

    updateButton(); // Actualiza el texto y color del botón
  });
}

// ======== 🚀 INICIALIZACIÓN ========
updateButton(); // Ajusta el botón al cargar la página
