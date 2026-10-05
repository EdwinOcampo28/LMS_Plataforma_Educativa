window.LMS = (() => {
  const KEYS = ['cursos','modulos','lecciones','docentes','estudiantes','administrativos','contenidos','misCursos'];

  function load(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value = JSON.parse(raw);
      return value ?? fallback;
    } catch (error) {
      console.warn(`No se pudo leer ${key} desde LocalStorage`, error);
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key, value } }));
      return true;
    } catch (error) {
      notify('No fue posible guardar los cambios en el navegador.', 'error');
      return false;
    }
  }

  function escapeHTML(value = '') {
    return String(value)
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function notify(message, type = 'success') {
    let container = document.getElementById('lmsToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'lmsToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i><span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  function confirmAction(message, onConfirm) {
    if (window.confirm(message)) onConfirm();
  }

  function normalize(value = '') {
    return String(value).trim().toLocaleLowerCase('es');
  }

  function emptyState(message = 'No hay registros disponibles.') {
    return `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><h3>${escapeHTML(message)}</h3><p>Cuando agregues información aparecerá aquí.</p></div>`;
  }

  return { KEYS, load, save, escapeHTML, notify, confirmAction, normalize, emptyState };
})();
