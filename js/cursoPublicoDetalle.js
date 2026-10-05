const code = localStorage.getItem('cursoSeleccionado');
const estudianteActivo = JSON.parse(sessionStorage.getItem('estudianteActivo') || 'null'); const cursos=LMS.load('cursos'); const curso=cursos.find(c=>c.codigo===code); const title=document.getElementById('tituloCurso'),info=document.getElementById('infoCurso'),modulosDiv=document.getElementById('modulos');
if(!curso){title.textContent='Curso no encontrado';info.innerHTML=LMS.emptyState('No encontramos el curso seleccionado.');document.getElementById('joinCourse').disabled=true;}else{title.textContent=curso.nombre;info.innerHTML=`<div class="courseInfoGrid"><div><span>Docente</span><strong>${LMS.escapeHTML(curso.docenteNombre||'Sin asignar')}</strong></div><div><span>Categoría</span><strong>${LMS.escapeHTML(curso.categoria||'General')}</strong></div><div><span>Duración</span><strong>${LMS.escapeHTML(curso.duracion||'No definida')}</strong></div><div><span>Estado</span><strong>${LMS.escapeHTML(curso.estado||'No definido')}</strong></div></div><p class="courseDescription">${LMS.escapeHTML(curso.descripcion||'Este curso todavía no tiene descripción.')}</p>`;render();}
function render(){
  const mods=LMS.load('modulos').filter(m=>m.cursoCodigo===curso.codigo), less=LMS.load('lecciones');
  const done=LMS.load(estudianteActivo ? `progreso_${estudianteActivo.codigo}_${curso.codigo}` : `progreso_${curso.codigo}`, []);
  const total=less.filter(l=>l.cursoCodigo===curso.codigo).length;
  const percent=total ? Math.round((done.length/total)*100) : 0;
  const progressBox=document.getElementById('progresoCurso');
  if(progressBox) progressBox.innerHTML=`<div class="card progressRingRow"><div class="progressRing" style="--progress:${percent}"><strong>${percent}%</strong></div><div><strong>Tu progreso</strong><p class="muted">${done.length} de ${total} lecciones completadas.</p></div></div>`;
  modulosDiv.innerHTML=mods.length?mods.map(m=>{const items=less.filter(l=>l.cursoCodigo===curso.codigo&&l.moduloNombre===m.nombre);return `<article class="card moduleCard"><span class="badge badge-primary">Módulo</span><h3>${LMS.escapeHTML(m.nombre)}</h3><ul class="lessonList">${items.length?items.map(l=>{const key=l.titulo;const completed=done.includes(key);return `<li class="lessonItem ${completed?'completed':''}" data-lesson="${LMS.escapeHTML(key)}"><i class="fa-solid ${completed?'fa-circle-check':'fa-circle-play'}"></i><span>${LMS.escapeHTML(l.titulo)}</span><span class="lessonCheck"><i class="fa-solid ${completed?'fa-check':'fa-circle'}"></i></span></li>`}).join(''):'<li class="muted">Sin lecciones publicadas.</li>'}</ul></article>`}).join(''):LMS.emptyState('No hay módulos publicados todavía.');
  document.querySelectorAll('.lessonItem').forEach(item=>item.addEventListener('click',()=>toggleLesson(item.dataset.lesson)));
}
function toggleLesson(title){
  const key=estudianteActivo ? `progreso_${estudianteActivo.codigo}_${curso.codigo}` : `progreso_${curso.codigo}`;
  const done=LMS.load(key, []);
  const next=done.includes(title)?done.filter(x=>x!==title):[...done,title];
  LMS.save(key,next);
  render();
  LMS.notify(next.includes(title)?'Lección marcada como completada.':'Lección marcada como pendiente.');
}
document.getElementById('joinCourse')?.addEventListener('click',()=>{if(!estudianteActivo){LMS.notify('Entra al Portal del Estudiante para inscribirte.','warning');window.location.href='estudiante.html';return;}const all=LMS.load('inscripciones',{});all[estudianteActivo.codigo]=all[estudianteActivo.codigo]||[];if(all[estudianteActivo.codigo].includes(curso.codigo))return LMS.notify('Ya estás inscrito en este curso.','warning');all[estudianteActivo.codigo].push(curso.codigo);LMS.save('inscripciones',all);LMS.notify(`Te has inscrito en ${curso.nombre}.`);document.getElementById('joinCourse').textContent='Inscrito ✓';});
