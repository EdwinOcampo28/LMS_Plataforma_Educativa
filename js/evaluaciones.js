const evaluaciones = LMS.load('evaluaciones', []);
const cursos = LMS.load('cursos', []);
const form = document.getElementById('evaluacionForm');
const lista = document.getElementById('listaEvaluaciones');
const curso = document.getElementById('evaluacionCurso');
const tituloEl = document.getElementById('evaluacionTitulo');
let preguntasActuales = [];

function cargarCursos() {
  if (!curso) return;
  const activos = cursos.filter(c => c && c.codigo);
  curso.innerHTML = '<option value="">Seleccionar curso</option>' + activos.map(c => `<option value="${LMS.escapeHTML(c.codigo)}">${LMS.escapeHTML(c.nombre || c.codigo)}</option>`).join('');
  if (!activos.length) {
    curso.disabled = true;
    const hint = document.createElement('p');
    hint.className = 'hint evaluationHint';
    hint.innerHTML = 'Primero debes crear un curso en <a href="cursos.html">Cursos</a> para poder asociarle una evaluación.';
    form?.prepend(hint);
  }
}

function limpiarPregunta() {
  ['preguntaTexto','opcion1','opcion2','opcion3','opcion4'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  const correct=document.getElementById('respuestaCorrecta'); if(correct) correct.value='0';
}

function renderPreguntas() {
  const box = document.getElementById('preguntasPreview');
  if (!box) return;
  box.innerHTML = preguntasActuales.length ? preguntasActuales.map((p,i) => `<div class="questionPreview"><div><span class="badge badge-primary">Pregunta ${i+1}</span><strong>${LMS.escapeHTML(p.texto)}</strong><small>Correcta: ${LMS.escapeHTML(p.opciones[p.correcta] || '')}</small></div><button type="button" class="btn-danger" onclick="quitarPregunta(${i})">Quitar</button></div>`).join('') : LMS.emptyState('Agrega al menos una pregunta para construir la evaluación.');
}

document.getElementById('agregarPregunta')?.addEventListener('click', () => {
  const texto = document.getElementById('preguntaTexto')?.value.trim() || '';
  const opciones = [1,2,3,4].map(i => document.getElementById(`opcion${i}`)?.value.trim() || '');
  const correcta = Number(document.getElementById('respuestaCorrecta')?.value ?? 0);
  if (!texto) return LMS.notify('Escribe el enunciado de la pregunta.', 'error');
  if (opciones.some(x => !x)) return LMS.notify('Completa las cuatro opciones de respuesta.', 'error');
  preguntasActuales.push({ texto, opciones, correcta });
  limpiarPregunta();
  renderPreguntas();
  LMS.notify(`Pregunta ${preguntasActuales.length} agregada.`, 'success');
});

function quitarPregunta(i) {
  if (i < 0 || i >= preguntasActuales.length) return;
  preguntasActuales.splice(i,1);
  renderPreguntas();
}

form?.addEventListener('submit', e => {
  e.preventDefault();
  const cursoCodigo = curso?.value || '';
  const titulo = tituloEl?.value.trim() || '';
  if (!cursoCodigo) return LMS.notify('Selecciona el curso al que pertenece la evaluación.', 'error');
  if (!titulo) return LMS.notify('Escribe el título de la evaluación.', 'error');
  if (!preguntasActuales.length) return LMS.notify('Agrega al menos una pregunta antes de guardar.', 'error');
  const cursoExiste = cursos.some(c => c.codigo === cursoCodigo);
  if (!cursoExiste) return LMS.notify('El curso seleccionado ya no existe. Actualiza la página.', 'error');
  evaluaciones.push({ id: `EV-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, cursoCodigo, titulo, preguntas: preguntasActuales.map(p => ({...p})), creadoEn: new Date().toISOString() });
  LMS.save('evaluaciones', evaluaciones);
  form.reset();
  preguntasActuales = [];
  renderPreguntas();
  render();
  LMS.notify('Evaluación creada correctamente.', 'success');
});

function eliminarEvaluacion(i) {
  LMS.confirmAction('¿Eliminar esta evaluación?', () => {
    evaluaciones.splice(i,1);
    LMS.save('evaluaciones',evaluaciones);
    render();
    LMS.notify('Evaluación eliminada.');
  });
}

function render() {
  if (!lista) return;
  lista.innerHTML = evaluaciones.length ? evaluaciones.map((e,i) => {
    const c = cursos.find(x => x.codigo === e.cursoCodigo);
    return `<article class="card evaluationCard"><div><span class="badge badge-primary">${LMS.escapeHTML(c?.nombre || e.cursoCodigo)}</span><h3>${LMS.escapeHTML(e.titulo)}</h3><p>${e.preguntas?.length || 0} pregunta(s)</p></div><div class="actions"><button class="btn-danger" type="button" onclick="eliminarEvaluacion(${i})">Eliminar</button></div></article>`;
  }).join('') : LMS.emptyState('No hay evaluaciones creadas.');
}

cargarCursos();
renderPreguntas();
render();
