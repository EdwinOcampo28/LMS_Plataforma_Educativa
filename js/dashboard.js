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
  const canvas = document.getElementById('graficaDashboard'); if (!canvas || typeof Chart === 'undefined') return;
  if (window.lmsChart) window.lmsChart.destroy();
  const data = [cargar('cursos').length, cargar('estudiantes').length, cargar('docentes').length, cargar('administrativos').length, cargar('modulos').length];
  window.lmsChart = new Chart(canvas, { type: 'bar', data: { labels: ['Cursos','Estudiantes','Docentes','Administrativos','Módulos'], datasets: [{ label: 'Registros', data, borderRadius: 10, borderSkipped: false }] }, options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } } });
}

function cargarCursos() {
  const contenedor = document.getElementById('listaCursos'); if (!contenedor) return;
  const cursos = cargar('cursos');
  contenedor.innerHTML = cursos.length ? cursos.map(c => `<article class="courseCard"><div class="courseBody"><span class="badge badge-primary">${LMS.escapeHTML(c.categoria || 'Curso')}</span><div class="courseTitle">${LMS.escapeHTML(c.nombre)}</div><div class="courseTeacher"><i class="fa-solid fa-chalkboard-user"></i> ${LMS.escapeHTML(c.docenteNombre || 'Sin docente')}</div><p>${LMS.escapeHTML(c.descripcion || 'Sin descripción')}</p><div class="courseMeta"><span>${LMS.escapeHTML(c.duracion || 'Duración no definida')}</span><span>${LMS.escapeHTML(c.estado || 'Sin estado')}</span></div><a class="btn-link" href="curso.html?curso=${encodeURIComponent(c.codigo)}">Ver curso <i class="fa-solid fa-arrow-right"></i></a></div></article>`).join('') : LMS.emptyState('No hay cursos registrados.');
}

function cursoPopular() {
  const target = document.getElementById('cursoPopular'); if (!target) return;
  const cursos = cargar('cursos'); const inscritos = cargar('misCursos');
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
window.addEventListener('lms:data-change', renderDashboard);
