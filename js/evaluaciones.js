const evaluaciones = LMS.load('evaluaciones');
const cursos = LMS.load('cursos');
const form = document.getElementById('evaluacionForm');
const lista = document.getElementById('listaEvaluaciones');
const curso = document.getElementById('evaluacionCurso');
let preguntasActuales = [];

function cargarCursos() {
  if (!curso) return;
  curso.innerHTML = '<option value="">Seleccionar curso</option>' + cursos.map(c => `<option value="${LMS.escapeHTML(c.codigo)}">${LMS.escapeHTML(c.nombre)}</option>`).join('');
}

function renderPreguntas() {
  const box = document.getElementById('preguntasPreview');
  if (!box) return;
  box.innerHTML = preguntasActuales.length ? preguntasActuales.map((p,i) => `<div class="questionPreview"><div><span class="badge badge-primary">Pregunta ${i+1}</span><strong>${LMS.escapeHTML(p.texto)}</strong><small>Correcta: ${LMS.escapeHTML(p.opciones[p.correcta] || '')}</small></div><button type="button" class="btn-danger" onclick="quitarPregunta(${i})">Quitar</button></div>`).join('') : LMS.emptyState('Agrega preguntas para construir la evaluación.');
}

document.getElementById('agregarPregunta')?.addEventListener('click', () => {
  const texto = document.getElementById('preguntaTexto').value.trim();
  const opciones = [1,2,3,4].map(i => document.getElementById(`opcion${i}`).value.trim());
  const correcta = Number(document.getElementById('respuestaCorrecta').value);
  if (!texto || opciones.some(x => !x)) return LMS.notify('Completa la pregunta y las cuatro opciones.', 'error');
  preguntasActuales.push({ texto, opciones, correcta });
  ['preguntaTexto','opcion1','opcion2','opcion3','opcion4'].forEach(id => document.getElementById(id).value='');
  document.getElementById('respuestaCorrecta').value='0';
  renderPreguntas();
});

function quitarPregunta(i) { preguntasActuales.splice(i,1); renderPreguntas(); }

form?.addEventListener('submit', e => {
  e.preventDefault();
  const titulo = document.getElementById('evaluacionTitulo').value.trim();
  if (!curso.value || !titulo || !preguntasActuales.length) return LMS.notify('Selecciona un curso, indica un título y agrega al menos una pregunta.', 'error');
  evaluaciones.push({ id: `EV-${Date.now()}`, cursoCodigo: curso.value, titulo, preguntas: preguntasActuales, creadoEn: new Date().toISOString() });
  LMS.save('evaluaciones', evaluaciones); form.reset(); preguntasActuales=[]; renderPreguntas(); render(); LMS.notify('Evaluación creada correctamente.');
});

function eliminarEvaluacion(i) { LMS.confirmAction('¿Eliminar esta evaluación?', () => { evaluaciones.splice(i,1); LMS.save('evaluaciones',evaluaciones); render(); LMS.notify('Evaluación eliminada.'); }); }
function render() {
  if (!lista) return;
  lista.innerHTML = evaluaciones.length ? evaluaciones.map((e,i) => { const c=cursos.find(x=>x.codigo===e.cursoCodigo); return `<article class="card evaluationCard"><div><span class="badge badge-primary">${LMS.escapeHTML(c?.nombre || e.cursoCodigo)}</span><h3>${LMS.escapeHTML(e.titulo)}</h3><p>${e.preguntas.length} pregunta(s)</p></div><div class="actions"><button class="btn-danger" type="button" onclick="eliminarEvaluacion(${i})">Eliminar</button></div></article>`; }).join('') : LMS.emptyState('No hay evaluaciones creadas.');
}
cargarCursos(); renderPreguntas(); render();
