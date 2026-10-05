const lista = document.getElementById('listaCursos');
let misCursos = LMS.load('misCursos');

function renderCursosPublicos() {
  const cursos = LMS.load('cursos');
  const modulos = LMS.load('modulos');
  const lecciones = LMS.load('lecciones');
  if (!lista) return;
  if (!cursos.length) { lista.innerHTML = LMS.emptyState('No hay cursos disponibles.'); return; }
  lista.innerHTML = cursos.map((curso, i) => {
    const mods = modulos.filter(m => m.cursoCodigo === curso.codigo);
    const totalLessons = lecciones.filter(l => l.cursoCodigo === curso.codigo).length;
    const joined = misCursos.includes(curso.codigo);
    return `<article class="courseCard"><div class="courseVisual courseVisual-${i % 5}"><i class="fa-solid fa-graduation-cap"></i></div><div class="courseBody"><span class="badge ${curso.estado === 'Activo' ? 'badge-success' : 'badge-muted'}">${LMS.escapeHTML(curso.estado || 'Sin estado')}</span><div class="courseTitle">${LMS.escapeHTML(curso.nombre)}</div><div class="courseTeacher">${LMS.escapeHTML(curso.docenteNombre || 'Docente no asignado')}</div><p>${LMS.escapeHTML(curso.descripcion || 'Este curso todavía no tiene descripción.')}</p><div class="courseMeta"><span><i class="fa-solid fa-layer-group"></i> ${mods.length} módulos</span><span><i class="fa-solid fa-book-open"></i> ${totalLessons} lecciones</span></div><div class="courseActions"><button class="${joined ? 'btn-secondary' : ''}" onclick="unirseCurso('${LMS.escapeHTML(curso.codigo)}')">${joined ? 'Inscrito ✓' : 'Unirme al curso'}</button><button class="btn-outline" onclick="verCurso('${LMS.escapeHTML(curso.codigo)}')">Ver detalles</button></div></div></article>`;
  }).join('');
}

function unirseCurso(codigo) {
  if (misCursos.includes(codigo)) { LMS.notify('Ya estás inscrito en este curso.', 'warning'); return; }
  misCursos.push(codigo); LMS.save('misCursos', misCursos); LMS.notify('Te has inscrito correctamente.'); renderCursosPublicos();
}
function verCurso(codigo) { localStorage.setItem('cursoSeleccionado', codigo); window.location.href = '../cursopublico.html'; }
renderCursosPublicos();
