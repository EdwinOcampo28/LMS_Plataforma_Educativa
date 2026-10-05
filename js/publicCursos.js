const lista = document.getElementById('listaCursos');
const buscarPublico = document.getElementById('buscarPublico');
const filtrarCategoria = document.getElementById('filtrarCategoria');
let misCursos = LMS.load('misCursos');
const estudianteActivo = JSON.parse(sessionStorage.getItem('estudianteActivo') || 'null');
const inscripciones = LMS.load('inscripciones', {});

function renderCursosPublicos() {
  const cursos = LMS.load('cursos');
  const modulos = LMS.load('modulos');
  const lecciones = LMS.load('lecciones');
  if (!lista) return;
  if (!cursos.length) { lista.innerHTML = LMS.emptyState('No hay cursos disponibles.'); return; }
  const q = LMS.normalize(buscarPublico?.value || '');
  const categoria = filtrarCategoria?.value || '';
  const visibles = cursos.filter(c => {
    const texto = LMS.normalize(`${c.nombre} ${c.categoria || ''} ${c.docenteNombre || ''}`);
    return (!q || texto.includes(q)) && (!categoria || c.categoria === categoria);
  });
  if (!visibles.length) { lista.innerHTML = LMS.emptyState('No hay cursos que coincidan con los filtros.'); return; }
  lista.innerHTML = visibles.map((curso, i) => {
    const mods = modulos.filter(m => m.cursoCodigo === curso.codigo);
    const totalLessons = lecciones.filter(l => l.cursoCodigo === curso.codigo).length;
    const joined = estudianteActivo ? (inscripciones[estudianteActivo.codigo] || []).includes(curso.codigo) : misCursos.includes(curso.codigo);
    return `<article class="courseCard"><div class="courseVisual courseVisual-${i % 5}"><i class="fa-solid fa-graduation-cap"></i></div><div class="courseBody"><span class="badge ${curso.estado === 'Activo' ? 'badge-success' : 'badge-muted'}">${LMS.escapeHTML(curso.estado || 'Sin estado')}</span><div class="courseTitle">${LMS.escapeHTML(curso.nombre)}</div><div class="courseTeacher">${LMS.escapeHTML(curso.docenteNombre || 'Docente no asignado')}</div><p>${LMS.escapeHTML(curso.descripcion || 'Este curso todavía no tiene descripción.')}</p><div class="courseMeta"><span><i class="fa-solid fa-layer-group"></i> ${mods.length} módulos</span><span><i class="fa-solid fa-book-open"></i> ${totalLessons} lecciones</span></div><div class="courseActions"><button class="${joined ? 'btn-secondary' : ''}" onclick="unirseCurso('${LMS.escapeHTML(curso.codigo)}')">${joined ? 'Inscrito ✓' : 'Unirme al curso'}</button><button class="btn-outline" onclick="verCurso('${LMS.escapeHTML(curso.codigo)}')">Ver detalles</button></div></div></article>`;
  }).join('');
}

function unirseCurso(codigo) {
  if (!estudianteActivo) { LMS.notify('Primero entra al Portal del Estudiante para inscribirte con tu perfil.', 'warning'); setTimeout(() => window.location.href='../estudiante.html', 500); return; }
  const data = LMS.load('inscripciones', {});
  data[estudianteActivo.codigo] = data[estudianteActivo.codigo] || [];
  if (data[estudianteActivo.codigo].includes(codigo)) { LMS.notify('Ya estás inscrito en este curso.', 'warning'); return; }
  data[estudianteActivo.codigo].push(codigo); LMS.save('inscripciones', data); LMS.notify('Te has inscrito correctamente.'); renderCursosPublicos();
}
function verCurso(codigo) { localStorage.setItem('cursoSeleccionado', codigo); window.location.href = '../cursopublico.html'; }
renderCursosPublicos();


buscarPublico?.addEventListener('input', renderCursosPublicos);
filtrarCategoria?.addEventListener('change', renderCursosPublicos);
