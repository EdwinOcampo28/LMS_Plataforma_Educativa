(() => {
  const isRoot = !location.pathname.includes('/pages/');
  const base = isRoot ? '' : '../';
  const current = location.pathname.split('/').pop() || 'dashboard.html';
  const items = [
    {group:'Principal', links:[
      ['dashboard.html','fa-chart-line','Dashboard'],
      ['pages/cursos.html','fa-book','Cursos'],
      ['pages/contenidos.html','fa-folder-open','Contenidos'],
      ['pages/evaluaciones.html','fa-clipboard-check','Evaluaciones']
    ]},
    {group:'Gestión académica', links:[
      ['pages/docentes.html','fa-chalkboard-user','Docentes'],
      ['pages/estudiantes.html','fa-user-graduate','Estudiantes'],
      ['pages/administrativos.html','fa-user-gear','Administrativos'],
      ['pages/reportes.html','fa-chart-pie','Reportes']
    ]},
    {group:'Mi espacio', links:[
      ['pages/mi-perfil.html','fa-user','Mi perfil'],
      ['pages/notificaciones.html','fa-bell','Notificaciones'],
      ['pages/calendario.html','fa-calendar-days','Calendario']
    ]},
    {group:'Sistema', links:[
      ['pages/datos.html','fa-database','Respaldo'],
      ['pages/auditoria.html','fa-clock-rotate-left','Auditoría'],
      ['public/cursos.html','fa-globe','Vista Pública']
    ]}
  ];
  const el = document.getElementById('appSidebar');
  if (!el) return;
  const isActive = (href) => {
    const target = href.split('/').pop();
    return current === target && ((current === 'dashboard.html') === (href === 'dashboard.html'));
  };
  el.innerHTML = `
    <div class="sidebarBrand"><div class="brandMark"><i class="fa-solid fa-graduation-cap"></i></div><div><strong>LMS</strong><small>Plataforma educativa</small></div></div>
    <div class="sidebarNav">${items.map(section => `
      <div class="navGroup"><div class="navGroupTitle">${section.group}</div>
      ${section.links.map(([href,icon,label]) => `<a class="${isActive(href)?'active':''}" href="${base}${href}"><i class="fa-solid ${icon}"></i><span>${label}</span></a>`).join('')}
      </div>`).join('')}
    </div>
    <div class="sidebarFooter"><a href="#" onclick="cerrarSesion(event)"><i class="fa-solid fa-right-from-bracket"></i><span>Salir</span></a></div>`;
})();
