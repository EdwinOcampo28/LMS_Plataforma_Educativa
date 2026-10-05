const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const admins = LMS.load('administrativos');
    const user = admins.find(admin => admin.email?.toLowerCase() === email && admin.password === password);

    if (!user) {
      LMS.notify('Correo o contraseña incorrectos.', 'error');
      return;
    }

    sessionStorage.setItem('usuarioActivo', JSON.stringify(user));
    const redirect = new URLSearchParams(location.search).get('redirect');
    window.location.href = redirect || 'dashboard.html';
  });
}
