(() => {
  const path = location.pathname.replace(/\\/g, '/');
  const inNested = /\/(pages|public)\//i.test(path);
  const base = inNested ? '../' : '';
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
      ['pages/certificados.html','fa-award','Certificados'],
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
    <div class="sidebarBrand"><div class="brandMark"><i class="fa-solid fa-graduation-cap"></i></div><div><strong>EDUNOVA</strong><small>Plataforma educativa</small></div></div>
    <div class="sidebarNav">${items.map(section => `
      <div class="navGroup"><div class="navGroupTitle">${section.group}</div>
      ${section.links.map(([href,icon,label]) => `<a class="${isActive(href)?'active':''}" href="${base}${href}"><i class="fa-solid ${icon}"></i><span>${label}</span>${label==='Notificaciones'?'<b class="navBadge" id="navNotifBadge" hidden>0</b>':''}</a>`).join('')}
      </div>`).join('')}
    </div>
    <div class="sidebarFooter"><a href="#" onclick="cerrarSesion(event)"><i class="fa-solid fa-right-from-bracket"></i><span>Salir</span></a></div>`;
})();

  function syncNotificationBadge(){
    const badge=document.getElementById('navNotifBadge');
    if(!badge) return;
    if(!window.LMSPro){
      badge.hidden=true;
      return false;
    }
    const count=Number(LMSPro.unreadCount?.() || 0);
    badge.textContent=count>99?'99+':String(count);
    badge.hidden=count===0;
  }

  // Sincronización robusta: cubre cambios en otra pestaña, navegación normal
  // y restauración desde BFCache al volver de la Vista Pública.
  const refreshBadge = () => requestAnimationFrame(syncNotificationBadge);
  const waitForLMSPro = (tries = 0) => {
    if (window.LMSPro) { syncNotificationBadge(); return; }
    if (tries < 20) setTimeout(() => waitForLMSPro(tries + 1), 50);
  };
  waitForLMSPro();
  refreshBadge();
  window.addEventListener('lms:data-change',e=>{
    if(e.detail?.key==='notificaciones') refreshBadge();
  });
  window.addEventListener('storage',e=>{
    if(e.key==='notificaciones' || e.key==='lms_notificacion_eliminada') refreshBadge();
  });
  window.addEventListener('pageshow',refreshBadge);
  window.addEventListener('focus',refreshBadge);
  window.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBadge();});
  window.addEventListener('popstate',refreshBadge);
  setTimeout(syncNotificationBadge,0);
  setTimeout(syncNotificationBadge,100);
  setTimeout(syncNotificationBadge,300);

