const cargar = (key) => LMS.load(key);
const guardar = (key, data) => LMS.save(key, data);

let cursos = cargar('cursos');
let modulos = cargar('modulos');
let lecciones = cargar('lecciones');
lecciones = lecciones.map((l,i)=>({...l,id:l.id||`LEC-LEGACY-${i}-${btoa(unescape(encodeURIComponent(l.cursoCodigo||''))).slice(0,8)}-${btoa(unescape(encodeURIComponent(l.titulo||''))).slice(0,8)}`}));
guardar('lecciones', lecciones);
let editandoCurso = null;
let editandoModulo = null;
let editandoLeccion = null;

const $ = id => document.getElementById(id);
const tablaCursos = $('tablaCursos');
const cursoForm = $('cursoForm');
const codigo = $('codigo');
const nombre = $('nombre');
const descripcion = $('descripcion');
const docente = $('docente');
const estudiante = $('estudiante');
const duracion = $('duracion');
const etiquetas = $('etiquetas');
const estado = $('estado');
const categoria = $('categoria');
const moduloForm = $('moduloForm');
const cursoModulo = $('cursoModulo');
const moduloNombre = $('moduloNombre');
const tablaModulos = $('tablaModulos');
const leccionForm = $('leccionForm');
const cursoLeccion = $('cursoLeccion');
const moduloLeccion = $('moduloLeccion');
const titulo = $('titulo');
const contenido = $('contenido');
const tablaLecciones = $('tablaLecciones');

function cargarSelectores() {
  const docentes = cargar('docentes');
  const estudiantes = cargar('estudiantes');
  if (docente) docente.innerHTML = '<option value="">Seleccionar docente</option>' + docentes.map(d => `<option value="${LMS.escapeHTML(d.codigo)}">${LMS.escapeHTML(d.codigo)} - ${LMS.escapeHTML(d.nombre)}</option>`).join('');
  if (estudiante) estudiante.innerHTML = '<option value="">Seleccionar estudiante</option>' + estudiantes.map(e => `<option value="${LMS.escapeHTML(e.codigo)}">${LMS.escapeHTML(e.codigo)} - ${LMS.escapeHTML(e.nombre)}</option>`).join('');
}

function cargarCursosEnSelect() {
  const options = '<option value="">Seleccionar curso</option>' + cursos.map(c => `<option value="${LMS.escapeHTML(c.codigo)}">${LMS.escapeHTML(c.codigo)} - ${LMS.escapeHTML(c.nombre)}</option>`).join('');
  if (cursoModulo) cursoModulo.innerHTML = options;
  if (cursoLeccion) cursoLeccion.innerHTML = options;
}

function validarCurso(curso, index) {
  const codigoDuplicado = cursos.some((c, i) => LMS.normalize(c.codigo) === LMS.normalize(curso.codigo) && i !== index);
  if (codigoDuplicado) return 'Ya existe un curso con ese código.';
  if (!curso.docenteCodigo) return 'Selecciona un docente válido.';
  return '';
}

if (cursoForm) {
  cursoForm.addEventListener('submit', event => {
    event.preventDefault();
    const docentes = cargar('docentes');
    const estudiantes = cargar('estudiantes');
    const docenteExiste = docentes.find(d => d.codigo === docente.value);
    const estudianteExiste = estudiantes.find(e => e.codigo === estudiante.value);

    const nuevoCurso = {
      codigo: codigo.value.trim(), nombre: nombre.value.trim(), descripcion: descripcion.value.trim(),
      docenteCodigo: docente.value, docenteNombre: docenteExiste?.nombre || '',
      estudianteCodigo: estudiante.value || '', estudianteNombre: estudianteExiste?.nombre || '',
      duracion: duracion.value.trim(), etiquetas: etiquetas.value.trim(), estado: estado.value,
      categoria: categoria?.value || ''
    };

    const error = validarCurso(nuevoCurso, editandoCurso);
    if (error) { LMS.notify(error, 'error'); return; }

    if (editandoCurso !== null) {
      const oldCode = cursos[editandoCurso].codigo;
      if (oldCode !== nuevoCurso.codigo && (modulos.some(m => m.cursoCodigo === oldCode) || lecciones.some(l => l.cursoCodigo === oldCode))) {
        LMS.notify('No puedes cambiar el código de un curso que ya tiene módulos o lecciones.', 'warning');
        return;
      }
      cursos[editandoCurso] = nuevoCurso;
      editandoCurso = null;
      LMS.notify('Curso actualizado correctamente.');
    } else {
      cursos.push(nuevoCurso);
      LMS.notify('Curso creado correctamente.');
    }

    guardar('cursos', cursos);
    cursoForm.reset();
    codigo.readOnly = false;
    cargarCursosEnSelect();
    renderCursos();
  });
}

function renderCursos() {
  if (!tablaCursos) return;
  const query = LMS.normalize(buscarCursos?.value || '');
  const estadoFiltro = filtrarEstado?.value || '';
  const visibles = cursos.map((c, i) => ({ c, i })).filter(({c}) => {
    const texto = LMS.normalize(`${c.codigo} ${c.nombre} ${c.categoria || ''} ${c.docenteNombre || ''}`);
    return (!query || texto.includes(query)) && (!estadoFiltro || c.estado === estadoFiltro);
  });
  if (!visibles.length) { tablaCursos.innerHTML = `<tr><td colspan="9">${LMS.emptyState('No hay cursos registrados.')}</td></tr>`; return; }
  tablaCursos.innerHTML = visibles.map(({c, i}) => {
    const totalModulos = modulos.filter(m => m.cursoCodigo === c.codigo).length;
    return `<tr><td>${LMS.escapeHTML(c.codigo)}</td><td><strong>${LMS.escapeHTML(c.nombre)}</strong><small>${LMS.escapeHTML(c.categoria || 'Sin categoría')}</small></td><td>${LMS.escapeHTML(c.docenteNombre)}</td><td>${Object.values(LMS.load('inscripciones', {})).filter(list => Array.isArray(list) && list.includes(c.codigo)).length}</td><td>${LMS.escapeHTML(c.duracion || '—')}</td><td>${LMS.escapeHTML(c.etiquetas || '—')}</td><td><span class="badge ${c.estado === 'Activo' ? 'badge-success' : 'badge-muted'}">${LMS.escapeHTML(c.estado)}</span></td><td>${totalModulos}</td><td class="actions"><button class="btn-secondary" onclick="editarCurso(${i})">Editar</button><button class="btn-danger" onclick="eliminarCurso(${i})">Eliminar</button></td></tr>`;
  }).join('');
}

function editarCurso(i) {
  const c = cursos[i]; if (!c) return;
  codigo.value = c.codigo; nombre.value = c.nombre; descripcion.value = c.descripcion || ''; docente.value = c.docenteCodigo || ''; estudiante.value = c.estudianteCodigo || '';
  duracion.value = c.duracion || ''; etiquetas.value = c.etiquetas || ''; estado.value = c.estado || ''; if (categoria) categoria.value = c.categoria || '';
  editandoCurso = i; codigo.readOnly = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarCurso(i) {
  const curso = cursos[i]; if (!curso) return;
  if (modulos.some(m => m.cursoCodigo === curso.codigo) || lecciones.some(l => l.cursoCodigo === curso.codigo)) {
    LMS.notify('No se puede eliminar el curso porque tiene módulos o lecciones.', 'warning'); return;
  }
  LMS.confirmAction(`¿Eliminar el curso “${curso.nombre}”?`, () => { cursos.splice(i, 1); guardar('cursos', cursos); cargarCursosEnSelect(); renderCursos(); LMS.notify('Curso eliminado.'); });
}

if (moduloForm) moduloForm.addEventListener('submit', event => {
  event.preventDefault(); const cursoCodigo = cursoModulo.value; const name = moduloNombre.value.trim();
  if (!cursoCodigo || !name) { LMS.notify('Selecciona un curso e indica el nombre del módulo.', 'error'); return; }
  const duplicate = modulos.some((m, i) => m.cursoCodigo === cursoCodigo && LMS.normalize(m.nombre) === LMS.normalize(name) && i !== editandoModulo);
  if (duplicate) { LMS.notify('Ya existe un módulo con ese nombre en el curso.', 'warning'); return; }
  if (editandoModulo !== null) {
    const oldName = modulos[editandoModulo].nombre;
    modulos[editandoModulo] = { cursoCodigo, nombre: name };
    lecciones = lecciones.map(l => l.cursoCodigo === cursoCodigo && l.moduloNombre === oldName ? { ...l, moduloNombre: name } : l);
    guardar('lecciones', lecciones); editandoModulo = null; LMS.notify('Módulo actualizado.');
  } else { modulos.push({ cursoCodigo, nombre: name }); LMS.notify('Módulo creado.'); }
  guardar('modulos', modulos); moduloForm.reset(); renderModulos(); renderLecciones();
});

function renderModulos() {
  if (!tablaModulos) return;
  tablaModulos.innerHTML = modulos.length ? modulos.map((m, i) => { const curso = cursos.find(c => c.codigo === m.cursoCodigo); const count = lecciones.filter(l => l.cursoCodigo === m.cursoCodigo && l.moduloNombre === m.nombre).length; return `<tr><td>${LMS.escapeHTML(curso?.nombre || 'Curso eliminado')}</td><td><strong>${LMS.escapeHTML(m.nombre)}</strong><small>${count} lección(es)</small></td><td class="actions"><button class="btn-secondary" onclick="editarModulo(${i})">Editar</button><button class="btn-danger" onclick="eliminarModulo(${i})">Eliminar</button></td></tr>`; }).join('') : `<tr><td colspan="3">${LMS.emptyState('No hay módulos registrados.')}</td></tr>`;
}

function editarModulo(i) { const m = modulos[i]; if (!m) return; cursoModulo.value = m.cursoCodigo; moduloNombre.value = m.nombre; editandoModulo = i; window.scrollTo({ top: document.getElementById('moduloForm')?.offsetTop || 0, behavior: 'smooth' }); }
function eliminarModulo(i) { const m = modulos[i]; if (!m) return; if (lecciones.some(l => l.cursoCodigo === m.cursoCodigo && l.moduloNombre === m.nombre)) { LMS.notify('No se puede eliminar el módulo porque tiene lecciones registradas.', 'warning'); return; } LMS.confirmAction(`¿Eliminar el módulo “${m.nombre}”?`, () => { modulos.splice(i,1); guardar('modulos',modulos); renderModulos(); cargarCursosEnSelect(); LMS.notify('Módulo eliminado.'); }); }

if (cursoLeccion) cursoLeccion.addEventListener('change', () => {
  const code = cursoLeccion.value; moduloLeccion.innerHTML = '<option value="">Seleccionar módulo</option>' + modulos.filter(m => m.cursoCodigo === code).map(m => `<option value="${LMS.escapeHTML(m.nombre)}">${LMS.escapeHTML(m.nombre)}</option>`).join('');
});

if (leccionForm) leccionForm.addEventListener('submit', event => {
  event.preventDefault(); const code = cursoLeccion.value; const mod = moduloLeccion.value; const title = titulo.value.trim(); const body = contenido.value.trim();
  if (!code || !mod || !title || !body) { LMS.notify('Completa curso, módulo, título y contenido.', 'error'); return; }
  const item = { id: editandoLeccion !== null ? (lecciones[editandoLeccion].id || `LEC-${Date.now()}-${Math.random().toString(36).slice(2,7)}`) : `LEC-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, cursoCodigo: code, moduloNombre: mod, titulo: title, contenido: body };
  if (editandoLeccion !== null) { lecciones[editandoLeccion] = item; editandoLeccion = null; LMS.notify('Lección actualizada.'); } else { lecciones.push(item); LMS.notify('Lección creada.'); }
  guardar('lecciones', lecciones); leccionForm.reset(); moduloLeccion.innerHTML = '<option value="">Seleccionar módulo</option>'; renderLecciones(); renderModulos();
});

function renderLecciones() {
  if (!tablaLecciones) return;
  tablaLecciones.innerHTML = lecciones.length ? lecciones.map((l, i) => { const curso = cursos.find(c => c.codigo === l.cursoCodigo); return `<tr><td>${LMS.escapeHTML(curso?.nombre || 'Curso eliminado')}</td><td>${LMS.escapeHTML(l.moduloNombre)}</td><td><strong>${LMS.escapeHTML(l.titulo)}</strong><small>${LMS.escapeHTML(l.contenido).slice(0, 100)}${l.contenido.length > 100 ? '…' : ''}</small></td><td class="actions"><button class="btn-secondary" onclick="editarLeccion(${i})">Editar</button><button class="btn-danger" onclick="eliminarLeccion(${i})">Eliminar</button></td></tr>`; }).join('') : `<tr><td colspan="4">${LMS.emptyState('No hay lecciones registradas.')}</td></tr>`;
}

function editarLeccion(i) { const l = lecciones[i]; if (!l) return; cursoLeccion.value = l.cursoCodigo; cursoLeccion.dispatchEvent(new Event('change')); setTimeout(() => { moduloLeccion.value = l.moduloNombre; }, 0); titulo.value = l.titulo; contenido.value = l.contenido; editandoLeccion = i; window.scrollTo({ top: leccionForm?.offsetTop || 0, behavior: 'smooth' }); }
function eliminarLeccion(i) { LMS.confirmAction('¿Eliminar esta lección?', () => { lecciones.splice(i,1); guardar('lecciones',lecciones); renderLecciones(); renderModulos(); LMS.notify('Lección eliminada.'); }); }

buscarCursos?.addEventListener('input', renderCursos);
filtrarEstado?.addEventListener('change', renderCursos);
cargarSelectores(); cargarCursosEnSelect(); renderCursos(); renderModulos(); renderLecciones();
