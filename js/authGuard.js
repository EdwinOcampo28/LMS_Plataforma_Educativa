(() => {
  const active = sessionStorage.getItem('usuarioActivo');
  if (!active) {
    const target = encodeURIComponent(location.href);
    location.href = `../index.html?redirect=${target}`;
  }
})();
