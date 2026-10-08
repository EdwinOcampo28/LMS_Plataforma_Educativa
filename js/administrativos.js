let admins = LMS.load('administrativos', []);
const form = document.getElementById('adminForm');
const lista = document.getElementById('listaAdmins');

function render() {
  if (!lista) return;
  lista.innerHTML = admins.length ? admins.map((a, i) => `
    <li class="card adminItem">
      <div>
        <span class="avatar">${LMS.escapeHTML((a.nombres || '?').charAt(0).toUpperCase())}</span>
        <div>
          <strong>${LMS.escapeHTML(a.nombres || '')} ${LMS.escapeHTML(a.apellidos || '')}</strong>
          <p>${LMS.escapeHTML(a.email || '')}</p>
          <small>ID: ${LMS.escapeHTML(a.identificacion || '')} · Rol: Administrador</small>
        </div>
      </div>
      <div class="actions">
        <button class="btn-danger" type="button" onclick="eliminar(${i})"><i class="fa-solid fa-trash"></i> Eliminar</button>
      </div>
    </li>`).join('') : LMS.emptyState('No hay administrativos registrados.');
}

form?.addEventListener('submit', event => {
  event.preventDefault();
  const identificacion = document.getElementById('identificacion').value.trim();
  const nombres = document.getElementById('nombres').value.trim();
  const apellidos = document.getElementById('apellidos').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (!identificacion || !nombres || !apellidos || !email || password.length < 6) {
    LMS.notify('Completa todos los campos. La contraseña debe tener mínimo 6 caracteres.', 'error');
    return;
  }
  if (admins.some(a => a.identificacion === identificacion)) {
    LMS.notify('Ya existe un administrador con esa identificación.', 'warning'); return;
  }
  if (admins.some(a => a.email?.toLowerCase() === email)) {
    LMS.notify('Ya existe un administrador con ese correo.', 'warning'); return;
  }

  const admin = { identificacion, nombres, apellidos, email, password, role: 'admin', creadoEn: new Date().toISOString() };
  const creandoPrimero = admins.length === 0;
  admins.push(admin);
  LMS.save('administrativos', admins);
  form.reset();
  render();
  LMS.notify(creandoPrimero ? 'Administrador inicial creado correctamente.' : 'Administrador creado correctamente.', 'success');

  if (creandoPrimero && !sessionStorage.getItem('usuarioActivo')) {
    setTimeout(() => { window.location.href = '../index.html'; }, 900);
  }
});

function eliminar(index) {
  const admin = admins[index];
  if (!admin) return;
  if (admins.length === 1) {
    LMS.notify('Debe existir al menos un administrador del sistema.', 'warning'); return;
  }
  const active = JSON.parse(sessionStorage.getItem('usuarioActivo') || 'null');
  if (active?.email === admin.email) {
    LMS.notify('No puedes eliminar el administrador con el que estás conectado.', 'warning'); return;
  }
  LMS.confirmAction(`¿Eliminar a ${admin.nombres} ${admin.apellidos}?`, () => {
    admins.splice(index, 1);
    LMS.save('administrativos', admins);
    render();
    LMS.notify('Administrador eliminado correctamente.', 'success');
  });
}

render();
