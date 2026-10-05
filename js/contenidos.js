const contenidos = LMS.load('contenidos');
let editandoIndex = null;
const contenidoForm = document.getElementById('contenidoForm');
const contenidosCards = document.getElementById('contenidosCards');
const cursoInput = document.getElementById('cursoContenido');
const tituloInput = document.getElementById('tituloContenido');
const videoInput = document.getElementById('videoContenido');
const docInput = document.getElementById('documentoContenido');
const imgInput = document.getElementById('imagenContenido');
const enlaceInput = document.getElementById('enlaceContenido');

function cargarCursosContenido() {
  if (!cursoInput || cursoInput.tagName !== 'SELECT') return;
  const cursos = LMS.load('cursos');
  cursoInput.innerHTML = '<option value="">Seleccionar curso</option>' + cursos.map(c => `<option value="${LMS.escapeHTML(c.codigo)}">${LMS.escapeHTML(c.nombre)}</option>`).join('');
}

contenidoForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!cursoInput.value || !tituloInput.value.trim()) { LMS.notify('Selecciona un curso y escribe un título.', 'error'); return; }
  const data = { curso: cursoInput.value, titulo: tituloInput.value.trim(), video: videoInput.value.trim(), documento: docInput.value.trim(), imagen: imgInput.value.trim(), enlace: enlaceInput.value.trim() };
  if (editandoIndex !== null) { contenidos[editandoIndex] = data; editandoIndex = null; LMS.notify('Contenido actualizado.'); } else { contenidos.push(data); LMS.notify('Contenido guardado.'); }
  LMS.save('contenidos', contenidos); contenidoForm.reset(); renderContenidos();
});

function renderContenidos() {
  if (!contenidosCards) return;
  const cursos = LMS.load('cursos');
  contenidosCards.innerHTML = contenidos.length ? contenidos.map((c, i) => { const curso = cursos.find(x => x.codigo === c.curso); return `<article class="card contentCard"><span class="badge badge-primary">${LMS.escapeHTML(curso?.nombre || c.curso)}</span>${c.imagen ? `<img src="${LMS.escapeHTML(c.imagen)}" alt="${LMS.escapeHTML(c.titulo)}" loading="lazy" onerror="this.style.display='none'">` : ''}<h3>${LMS.escapeHTML(c.titulo)}</h3><div class="contentLinks">${c.video ? `<a href="${LMS.escapeHTML(c.video)}" target="_blank" rel="noopener">Video <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}${c.documento ? `<a href="${LMS.escapeHTML(c.documento)}" target="_blank" rel="noopener">Documento <i class="fa-solid fa-file"></i></a>` : ''}${c.enlace ? `<a href="${LMS.escapeHTML(c.enlace)}" target="_blank" rel="noopener">Enlace <i class="fa-solid fa-link"></i></a>` : ''}</div><div class="actions"><button class="btn-secondary" onclick="editarContenido(${i})">Editar</button><button class="btn-danger" onclick="eliminarContenido(${i})">Eliminar</button></div></article>`; }).join('') : LMS.emptyState('No hay contenidos registrados.');
}
function editarContenido(i) { const c = contenidos[i]; if (!c) return; cursoInput.value=c.curso; tituloInput.value=c.titulo; videoInput.value=c.video||''; docInput.value=c.documento||''; imgInput.value=c.imagen||''; enlaceInput.value=c.enlace||''; editandoIndex=i; window.scrollTo({top:0,behavior:'smooth'}); }
function eliminarContenido(i) { LMS.confirmAction('¿Eliminar este contenido?', () => { contenidos.splice(i,1); LMS.save('contenidos',contenidos); renderContenidos(); LMS.notify('Contenido eliminado.'); }); }
cargarCursosContenido(); renderContenidos();
