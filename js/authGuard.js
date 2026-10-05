(() => {
  // Bootstrap seguro: si todavía no existe ningún administrador,
  // la pantalla de Administrativos queda disponible para crear el primero.
  const admins = (() => {
    try { return JSON.parse(localStorage.getItem('administrativos') || '[]') || []; }
    catch { return []; }
  })();
  const isAdminSetup = /pages\/administrativos\.html$/i.test(location.pathname);
  if (isAdminSetup && admins.length === 0) return;

  const active = sessionStorage.getItem('usuarioActivo');
  if (!active) {
    const target = encodeURIComponent(location.href);
    location.href = `../index.html?redirect=${target}`;
    return;
  }

  try {
    const user = JSON.parse(active);
    if (!user || user.role !== 'admin') {
      sessionStorage.removeItem('usuarioActivo');
      const target = encodeURIComponent(location.href);
      location.href = `../index.html?redirect=${target}`;
    }
  } catch {
    sessionStorage.removeItem('usuarioActivo');
    location.href = `../index.html?redirect=${encodeURIComponent(location.href)}`;
  }
})();
