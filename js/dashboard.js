const cargar = key => LMS.load(key);

function animarContador(elemento, valorFinal) {
  if (!elemento) return;
  const inicio = Number(elemento.dataset.value || 0);
  const duracion = 650;
  const start = performance.now();
  function frame(now) {
    const progreso = Math.min((now - start) / duracion, 1);
    const valor = Math.round(inicio + (valorFinal - inicio) * (1 - Math.pow(1 - progreso, 3)));
    elemento.textContent = valor;
    if (progreso < 1) requestAnimationFrame(frame); else elemento.dataset.value = valorFinal;
  }
  requestAnimationFrame(frame);
}

function actualizarDashboard() {
  const data = { cursos: cargar('cursos'), estudiantes: cargar('estudiantes'), docentes: cargar('docentes'), administrativos: cargar('administrativos'), modulos: cargar('modulos'), lecciones: cargar('lecciones') };
  Object.entries({ totalCursos: data.cursos.length, totalEstudiantes: data.estudiantes.length, totalDocentes: data.docentes.length, totalAdmins: data.administrativos.length, totalModulos: data.modulos.length }).forEach(([id, value]) => animarContador(document.getElementById(id), value));
  const lecciones = document.getElementById('totalLecciones'); if (lecciones) animarContador(lecciones, data.lecciones.length);
}

function crearGrafica() {
  const canvas = document.getElementById('graficaDashboard');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [cargar('cursos').length, cargar('estudiantes').length, cargar('docentes').length, cargar('administrativos').length, cargar('modulos').length];
  const labels = ['Cursos','Estudiantes','Docentes','Administrativos','Módulos'];
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 800, height = 300;
  canvas.width = width*dpr; canvas.height = height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,width,height);
  const max=Math.max(...data,1), pad=35, gap=18, barW=(width-pad*2-gap*(data.length-1))/data.length;
  ctx.font='600 12px Arial'; ctx.textAlign='center';
  data.forEach((value,i)=>{ const x=pad+i*(barW+gap); const h=(value/max)*(height-80); const y=height-45-h; ctx.fillStyle='#4f46e5'; ctx.roundRect(x,y,barW,h,10); ctx.fill(); ctx.fillStyle='#334155'; ctx.fillText(String(value),x+barW/2,y-8); ctx.fillStyle='#64748b'; ctx.fillText(labels[i],x+barW/2,height-20); });
}

function cargarCursos() {
  const contenedor = document.getElementById('listaCursos'); if (!contenedor) return;
  const cursos = cargar('cursos');
  contenedor.innerHTML = cursos.length ? cursos.map(c => `<article class="courseCard"><div class="courseBody"><span class="badge badge-primary">${LMS.escapeHTML(c.categoria || 'Curso')}</span><div class="courseTitle">${LMS.escapeHTML(c.nombre)}</div><div class="courseTeacher"><i class="fa-solid fa-chalkboard-user"></i> ${LMS.escapeHTML(c.docenteNombre || 'Sin docente')}</div><p>${LMS.escapeHTML(c.descripcion || 'Sin descripción')}</p><div class="courseMeta"><span>${LMS.escapeHTML(c.duracion || 'Duración no definida')}</span><span>${LMS.escapeHTML(c.estado || 'Sin estado')}</span></div><a class="btn-link" href="cursopublico.html?curso=${encodeURIComponent(c.codigo)}">Ver curso <i class="fa-solid fa-arrow-right"></i></a></div></article>`).join('') : LMS.emptyState('No hay cursos registrados.');
}

function cursoPopular() {
  const target = document.getElementById('cursoPopular'); if (!target) return;
  const cursos = cargar('cursos'); const inscripciones = cargar('inscripciones', {});
  const inscritos = Object.values(inscripciones).flatMap(x => Array.isArray(x) ? x : []);
  if (!cursos.length) { target.innerHTML = LMS.emptyState('Aún no hay cursos.'); return; }
  const popular = cursos.map(c => ({ ...c, inscritos: inscritos.filter(id => id === c.codigo).length })).sort((a,b) => b.inscritos-a.inscritos)[0];
  target.innerHTML = `<div class="popular-course"><div><span class="badge badge-primary">Más destacado</span><h3>${LMS.escapeHTML(popular.nombre)}</h3><p>Docente: ${LMS.escapeHTML(popular.docenteNombre || 'No asignado')}</p></div><strong>${popular.inscritos} inscripción(es)</strong></div>`;
}

function ultimosEstudiantes() {
  const tabla = document.getElementById('ultimosEstudiantes'); if (!tabla) return;
  const estudiantes = cargar('estudiantes').slice(-5).reverse();
  tabla.innerHTML = estudiantes.length ? estudiantes.map(e => `<tr><td>${LMS.escapeHTML(e.identificacion)}</td><td>${LMS.escapeHTML(`${e.nombres} ${e.apellidos}`)}</td><td>${LMS.escapeHTML(e.telefono)}</td></tr>`).join('') : `<tr><td colspan="3">${LMS.emptyState('No hay estudiantes registrados.')}</td></tr>`;
}

function renderDashboard() { actualizarDashboard(); crearGrafica(); cargarCursos(); cursoPopular(); ultimosEstudiantes(); }
renderDashboard();
window.addEventListener('resize', crearGrafica);
window.addEventListener('lms:data-change', renderDashboard);
window.addEventListener('storage', (event) => {
  if (['cursos','estudiantes','docentes','administrativos','modulos','lecciones','inscripciones'].includes(event.key)) renderDashboard();
});
