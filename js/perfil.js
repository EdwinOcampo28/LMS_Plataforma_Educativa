const active = LMSPro.currentAdmin();
const admins = LMS.load('administrativos', []);
const idx = admins.findIndex(a => a.email?.toLowerCase() === active?.email?.toLowerCase());
const f = document.getElementById('profileForm');

const fields = {
  id: document.getElementById('pId'),
  nombres: document.getElementById('pNombres'),
  apellidos: document.getElementById('pApellidos'),
  email: document.getElementById('pEmail'),
  currentPassword: document.getElementById('pCurrentPassword'),
  password: document.getElementById('pPassword'),
  confirmPassword: document.getElementById('pConfirmPassword')
};
const strength = document.getElementById('passwordStrength');
const strengthText = document.getElementById('passwordStrengthText');
const changes = document.getElementById('profileChanges');
const saveBtn = document.getElementById('saveProfileBtn');

if (idx < 0) {
  location.href = '../index.html';
} else {
  const original = { ...admins[idx] };

  const sync = () => {
    const current = admins[idx];
    document.getElementById('profileName').textContent = `${current.nombres || ''} ${current.apellidos || ''}`.trim() || 'Administrador';
    document.getElementById('profileEmail').textContent = current.email || '';
    document.getElementById('avatar').textContent = (current.nombres || 'A')[0].toUpperCase();
  };

  fields.id.value = original.identificacion || '';
  fields.nombres.value = original.nombres || '';
  fields.apellidos.value = original.apellidos || '';
  fields.email.value = original.email || '';
  sync();

  const passwordRules = (value) => ({
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value)
  });

  const isStrong = (value) => Object.values(passwordRules(value)).every(Boolean);

  function updatePasswordMeter() {
    const value = fields.password.value;
    if (!value) {
      strength.style.width = '0%';
      strength.className = 'passwordStrengthBar';
      strengthText.textContent = 'Sin cambio de contraseña';
      return;
    }
    const rules = passwordRules(value);
    const score = Object.values(rules).filter(Boolean).length;
    strength.style.width = `${score * 20}%`;
    strength.className = `passwordStrengthBar ${score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'}`;
    strengthText.textContent = score === 5 ? 'Contraseña fuerte' : score >= 3 ? 'Contraseña media: completa los requisitos' : 'Contraseña débil: completa los requisitos';
  }

  function changedFields() {
    const result = [];
    if (fields.id.value.trim() !== String(original.identificacion || '').trim()) result.push('Identificación');
    if (fields.nombres.value.trim() !== String(original.nombres || '').trim()) result.push('Nombres');
    if (fields.apellidos.value.trim() !== String(original.apellidos || '').trim()) result.push('Apellidos');
    if (fields.email.value.trim().toLowerCase() !== String(original.email || '').trim().toLowerCase()) result.push('Correo');
    if (fields.password.value) result.push('Contraseña');
    return result;
  }

  function updateChangeState() {
    const list = changedFields();
    if (!list.length) {
      changes.innerHTML = '<i class="fa-solid fa-circle-info"></i><span>No hay cambios pendientes.</span>';
      changes.className = 'profileChangeState neutral';
      saveBtn.disabled = false;
      return;
    }
    changes.innerHTML = `<i class="fa-solid fa-pen-to-square"></i><span>Cambios pendientes: <strong>${list.join(', ')}</strong></span>`;
    changes.className = 'profileChangeState pending';
  }

  [fields.id, fields.nombres, fields.apellidos, fields.email, fields.password, fields.confirmPassword, fields.currentPassword].forEach(el => {
    el.addEventListener('input', () => { updatePasswordMeter(); updateChangeState(); });
  });

  fields.password.addEventListener('input', () => {
    const rules = passwordRules(fields.password.value);
    document.querySelectorAll('[data-password-rule]').forEach(item => {
      const ok = Boolean(rules[item.dataset.passwordRule]);
      item.classList.toggle('valid', ok);
      const icon = item.querySelector('i');
      if (icon) icon.className = ok ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle';
    });
  });

  updatePasswordMeter();
  updateChangeState();

  f.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = fields.email.value.trim().toLowerCase();
    const newPassword = fields.password.value;
    const confirmPassword = fields.confirmPassword.value;
    const currentPassword = fields.currentPassword.value;
    const list = changedFields();

    if (!list.length) {
      LMS.notify('No hay cambios por realizar. Modifica algún dato antes de guardar.', 'warning');
      return;
    }

    if (!fields.id.value.trim() || !fields.nombres.value.trim() || !fields.apellidos.value.trim() || !email) {
      LMS.notify('Completa todos los campos obligatorios del perfil.', 'warning');
      return;
    }

    if (admins.some((x, i) => i !== idx && x.email?.toLowerCase() === email)) {
      LMS.notify('Ese correo ya está registrado.', 'warning');
      return;
    }

    const passwordChanged = Boolean(newPassword);
    if (passwordChanged) {
      if (!currentPassword) {
        LMS.notify('Para cambiar la contraseña debes escribir tu contraseña actual.', 'warning');
        fields.currentPassword.focus();
        return;
      }
      if (currentPassword !== original.password) {
        LMS.notify('La contraseña actual no es correcta.', 'error');
        fields.currentPassword.focus();
        return;
      }
      if (!isStrong(newPassword)) {
        LMS.notify('La nueva contraseña no cumple todos los requisitos de seguridad.', 'warning');
        fields.password.focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        LMS.notify('Las contraseñas nuevas no coinciden.', 'warning');
        fields.confirmPassword.focus();
        return;
      }
      if (newPassword === original.password) {
        LMS.notify('La nueva contraseña debe ser diferente de la contraseña actual.', 'warning');
        return;
      }
    }

    const previousEmail = original.email;
    const updated = {
      ...admins[idx],
      identificacion: fields.id.value.trim(),
      nombres: fields.nombres.value.trim(),
      apellidos: fields.apellidos.value.trim(),
      email,
      role: 'admin'
    };
    if (passwordChanged) updated.password = newPassword;

    admins[idx] = updated;
    LMS.save('administrativos', admins);
    sessionStorage.setItem('usuarioActivo', JSON.stringify(updated));

    if (window.LMSPro?.event) {
      if (passwordChanged) {
        LMSPro.event('CAMBIAR_CONTRASENA', 'perfil', email, 'Contraseña actualizada', 'La contraseña del administrador fue cambiada correctamente.', 'success', 'all');
      }
      const profileOnly = list.filter(x => x !== 'Contraseña');
      if (profileOnly.length) {
        LMSPro.event('ACTUALIZAR', 'perfil', `${profileOnly.join(', ')}${previousEmail !== email ? ` · Correo anterior: ${previousEmail}` : ''}`, 'Perfil actualizado', `Se actualizaron: ${profileOnly.join(', ')}.`, 'success', 'all');
      }
    }

    Object.assign(original, updated);
    fields.currentPassword.value = '';
    fields.password.value = '';
    fields.confirmPassword.value = '';
    sync();
    updatePasswordMeter();
    updateChangeState();
    LMS.notify(passwordChanged ? 'Contraseña actualizada correctamente.' : 'Cambios guardados correctamente.', 'success');
  });
}
