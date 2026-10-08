/**
 * Cierra únicamente la sesión administrativa y vuelve al login.
 * Usa una ruta relativa segura tanto desde la raíz como desde /pages/ y /public/.
 */
function cerrarSesion(event) {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  try {
    const active = JSON.parse(sessionStorage.getItem('usuarioActivo') || 'null');
    if (window.LMSPro?.audit && active?.email) LMSPro.audit('CERRAR_SESION','administrativo',active.email);
    sessionStorage.removeItem('usuarioActivo');
  } catch (error) {
    console.warn('No se pudo limpiar la sesión administrativa:', error);
  }

  const path = window.location.pathname.replace(/\\/g, '/');
  const inNestedSection = /\/(pages|public)\//i.test(path);
  const loginUrl = new URL(inNestedSection ? '../index.html' : 'index.html', window.location.href);

  // Evita que el botón Salir pueda volver a ejecutar una navegación rota.
  window.location.replace(loginUrl.href);
}
