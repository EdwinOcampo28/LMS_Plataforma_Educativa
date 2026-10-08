const code = new URLSearchParams(location.search).get('curso') || localStorage.getItem('cursoSeleccionado');
const estudianteActivo = JSON.parse(sessionStorage.getItem('estudianteActivo') || 'null');
const curso = LMS.load('cursos', []).find(c => c.codigo === code);
const title = document.getElementById('tituloCurso');
const info = document.getElementById('infoCurso');
const modulosDiv = document.getElementById('modulos');
const joinBtn = document.getElementById('joinCourse');
const leaveBtn = document.getElementById('leaveCourse');
const evalBtn = document.getElementById('courseEvaluation');
const progressBox = document.getElementById('progresoCurso');
const evalBox = document.getElementById('cursoEvaluacion');
const viewer = document.getElementById('lessonViewer');

function inscripciones(){
  const raw=LMS.load('inscripciones', {});
  if(!raw || Array.isArray(raw)) return {};
  const valid=new Set(LMS.load('cursos',[]).map(c=>c.codigo));
  const clean={};
  Object.entries(raw).forEach(([studentCode,list])=>{
    const unique=[...new Set(Array.isArray(list)?list:[])].filter(code=>valid.has(code));
    if(unique.length) clean[studentCode]=unique;
  });
  if(JSON.stringify(raw)!==JSON.stringify(clean)) LMS.saveRaw('inscripciones',clean);
  return clean;
}
function estaInscrito(){ return !!(estudianteActivo && (inscripciones()[estudianteActivo.codigo] || []).includes(curso?.codigo)); }
function lessonId(l){ return l.id || `${l.cursoCodigo}::${l.moduloNombre}::${l.titulo}`; }
function progresoKey(){ return estudianteActivo ? `progreso_${estudianteActivo.codigo}_${curso.codigo}` : `progreso_${curso.codigo}`; }
function progreso(){ return LMS.load(progresoKey(), []); }
function courseLessons(){ return LMS.load('lecciones',[]).filter(l=>l.cursoCodigo===curso?.codigo); }
function stats(){
  const lessons=courseLessons(), done=progreso();
  const doneCount=lessons.filter(l=>done.includes(lessonId(l)) || done.includes(l.titulo)).length;
  const percent=lessons.length?Math.round(doneCount/lessons.length*100):0;
  const grades=estudianteActivo?LMS.load('calificaciones',[]).filter(x=>x.estudianteCodigo===estudianteActivo.codigo&&x.cursoCodigo===curso.codigo).sort((a,b)=>Number(b.nota)-Number(a.nota)):[];
  const bestGrade=grades[0]||null;
  return {lessons,done,doneCount,percent,bestGrade,complete:lessons.length>0&&doneCount===lessons.length,passed:!!bestGrade&&Number(bestGrade.nota)>=70};
}
function markComplete(key){
  if(!estaInscrito()) return LMS.notify('Primero debes inscribirte en el curso.','warning');
  const done=progreso(); if(!done.includes(key)){done.push(key);LMS.save(progresoKey(),[...new Set(done)]);LMS.notify('Lección completada. ¡Sigue avanzando!','success');const lesson=courseLessons().find(l=>lessonId(l)===key);LMSPro?.event('COMPLETAR','leccion',`${estudianteActivo?.codigo||'estudiante'} · ${curso.codigo} · ${lesson?.titulo||key}`,'Lección completada',`Completaste: ${lesson?.titulo||'una lección'}.`,'success',estudianteActivo?.codigo||'all');}
  render();
}
function openLesson(key){
  if(!estaInscrito()){LMS.notify('Primero debes inscribirte para estudiar este curso.','warning');return;}
  const lesson=courseLessons().find(l=>lessonId(l)===key); if(!lesson)return;
  const st=stats(); const idx=st.lessons.findIndex(l=>lessonId(l)===key); const next=st.lessons[idx+1]; const completed=st.done.includes(key)||st.done.includes(lesson.titulo);
  viewer.innerHTML=`<div class="lessonViewerPanel"><button type="button" class="modalClose" id="closeLesson">×</button><span class="badge badge-primary">Lección ${idx+1} de ${st.lessons.length}</span><h2>${LMS.escapeHTML(lesson.titulo)}</h2><div class="lessonContent"><p>${LMS.escapeHTML(lesson.contenido||'Esta lección no tiene contenido escrito todavía.')}</p></div>${lesson.actividad?`<div class="lessonActivity"><strong><i class="fa-solid fa-lightbulb"></i> Actividad práctica</strong><p>${LMS.escapeHTML(lesson.actividad)}</p></div>`:''}<div class="lessonViewerActions"><button type="button" id="completeLesson" ${completed?'disabled':''}><i class="fa-solid ${completed?'fa-circle-check':'fa-check'}"></i> ${completed?'Lección completada':'Marcar como completada'}</button>${next?`<button type="button" class="btn-outline" id="nextLesson">Siguiente lección <i class="fa-solid fa-arrow-right"></i></button>`:'<span class="badge badge-success">Última lección del curso</span>'}</div></div>`;
  viewer.classList.add('open');
  document.getElementById('closeLesson').onclick=()=>viewer.classList.remove('open');
  document.getElementById('completeLesson').onclick=()=>{markComplete(key);openLesson(key);};
  document.getElementById('nextLesson')?.addEventListener('click',()=>{markComplete(key);openLesson(lessonId(next));});
}
function renderEvaluation(st){
  const evs=LMS.load('evaluaciones',[]).filter(e=>e.cursoCodigo===curso.codigo&&Array.isArray(e.preguntas)&&e.preguntas.length);
  if(evalBtn){
    evalBtn.style.display=evs.length?'inline-flex':'none';
    evalBtn.disabled=!estaInscrito()||!st.complete;
    evalBtn.innerHTML=st.complete?'<i class="fa-solid fa-clipboard-check"></i> Responder evaluación':'<i class="fa-solid fa-lock"></i> Completa las lecciones primero';
    evalBtn.onclick=()=>{if(!estudianteActivo){location.href='estudiante.html';return;}if(!st.complete){LMS.notify('Completa todas las lecciones antes de presentar la evaluación.','warning');return;}location.href=`estudiante.html?curso=${encodeURIComponent(curso.codigo)}`;};
  }
  if(!evalBox)return;
  if(!evs.length){evalBox.style.display='none';return;}
  evalBox.style.display='block';
  evalBox.innerHTML=`<span class="badge badge-primary">Evaluación final</span><h2>${LMS.escapeHTML(evs[0].titulo)}</h2><p>${evs[0].preguntas.length} preguntas. ${st.complete?'Ya puedes presentarla.':'Se desbloquea al completar todas las lecciones.'}</p>${st.bestGrade?`<p class="gradeLine"><i class="fa-solid fa-star"></i> Mejor nota: <strong>${Number(st.bestGrade.nota)}%</strong></p>`:''}`;
}
function renderResources(){
  const box=document.getElementById('cursoRecursos'); if(!box)return;
  const resources=LMS.load('contenidos',[]).filter(x=>x.curso===curso.codigo);
  if(!resources.length){box.innerHTML='';box.style.display='none';return;}
  box.style.display='block';
  box.innerHTML=`<h2>Recursos del curso</h2><div class="cards">${resources.map(r=>`<article class="card resourceCard"><span class="badge badge-primary">Recurso</span><h3>${LMS.escapeHTML(r.titulo)}</h3><div class="contentLinks">${r.video?`<a href="${LMS.escapeHTML(r.video)}" target="_blank" rel="noopener">Video <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`:''}${r.documento?`<a href="${LMS.escapeHTML(r.documento)}" target="_blank" rel="noopener">Documento <i class="fa-solid fa-file"></i></a>`:''}${r.enlace?`<a href="${LMS.escapeHTML(r.enlace)}" target="_blank" rel="noopener">Abrir recurso <i class="fa-solid fa-link"></i></a>`:''}</div></article>`).join('')}</div>`;
}
function salirDelCursoPublico(){
  if(!estudianteActivo||!curso||!estaInscrito())return;
  const data=inscripciones();
  const current=data[estudianteActivo.codigo]||[];
  LMS.confirmAction(`¿Deseas salir de \"${curso.nombre}\"? Tu progreso y calificaciones se conservarán.`,()=>{
    data[estudianteActivo.codigo]=current.filter(c=>c!==curso.codigo);
    if(!data[estudianteActivo.codigo].length) delete data[estudianteActivo.codigo];
    LMS.save('inscripciones',data);
    LMSPro?.event('SALIR','curso',`${estudianteActivo.codigo} · ${curso.codigo}`,'Saliste del curso',`Has salido de ${curso.nombre}. Tu progreso se conserva.`,'info',estudianteActivo.codigo);
    LMS.notify(`Saliste de ${curso.nombre}. Tu progreso se conserva.`,'success');
    render();
  });
}

function render(){
  if(!curso)return;
  const mods=LMS.load('modulos',[]).filter(m=>m.cursoCodigo===curso.codigo), st=stats();
  progressBox.innerHTML=`<div class="card progressRingRow"><div class="progressRing" style="--progress:${st.percent}"><strong>${st.percent}%</strong></div><div><strong>Tu progreso</strong><p class="muted">${st.doneCount} de ${st.lessons.length} lecciones completadas.</p><small>${st.complete?'Curso completado. La evaluación está desbloqueada.':'Completa las lecciones para desbloquear la evaluación.'}</small></div></div>`;
  modulosDiv.innerHTML=mods.length?mods.map((m,mi)=>{const items=st.lessons.filter(l=>l.moduloNombre===m.nombre);return `<article class="card moduleCard"><span class="badge badge-primary">Módulo ${mi+1}</span><h3>${LMS.escapeHTML(m.nombre)}</h3><ul class="lessonList">${items.map(l=>{const key=lessonId(l),done=st.done.includes(key)||st.done.includes(l.titulo);return `<li class="lessonItem ${done?'completed':''}" data-lesson-id="${LMS.escapeHTML(key)}"><button type="button" class="lessonOpen"><i class="fa-solid ${done?'fa-circle-check':'fa-circle-play'}"></i><span><strong>${LMS.escapeHTML(l.titulo)}</strong><small>${done?'Completada':'Abrir lección'}</small></span><i class="fa-solid fa-chevron-right"></i></button></li>`}).join('')}</ul></article>`}).join(''):LMS.emptyState('No hay módulos publicados todavía.');
  document.querySelectorAll('.lessonItem').forEach(item=>item.addEventListener('click',()=>openLesson(item.dataset.lessonId)));
  renderEvaluation(st);renderResources();
}

if(!curso){title.textContent='Curso no encontrado';info.innerHTML=LMS.emptyState('No encontramos el curso seleccionado.');if(joinBtn)joinBtn.disabled=true;}
else{
  title.textContent=curso.nombre;
  if(leaveBtn){leaveBtn.style.display=estaInscrito()?'inline-flex':'none';leaveBtn.onclick=salirDelCursoPublico;}

  info.innerHTML=`<div class="courseInfoGrid"><div><span>Docente</span><strong>${LMS.escapeHTML(curso.docenteNombre||'Sin asignar')}</strong></div><div><span>Categoría</span><strong>${LMS.escapeHTML(curso.categoria||'General')}</strong></div><div><span>Duración</span><strong>${LMS.escapeHTML(curso.duracion||'No definida')}</strong></div><div><span>Lecciones</span><strong>${courseLessons().length}</strong></div></div><p class="courseDescription">${LMS.escapeHTML(curso.descripcion||'Este curso todavía no tiene descripción.')}</p>`;
  if(joinBtn){joinBtn.textContent=estaInscrito()?'Continuar curso':'Empezar curso';joinBtn.disabled=curso.estado==='Inactivo';joinBtn.onclick=()=>{if(!estudianteActivo){LMS.notify('Entra al Portal del Estudiante para inscribirte.','warning');setTimeout(()=>location.href='estudiante.html',450);return;}const data=inscripciones();data[estudianteActivo.codigo]=data[estudianteActivo.codigo]||[];if(!data[estudianteActivo.codigo].includes(curso.codigo)){data[estudianteActivo.codigo].push(curso.codigo);LMS.save('inscripciones',data);LMSPro?.event('INSCRIBIR','curso',`${estudianteActivo.codigo} · ${curso.codigo}`,'Nueva inscripción',`Te inscribiste en ${curso.nombre}.`,'success',estudianteActivo.codigo);LMS.notify(`Te has inscrito en ${curso.nombre}.`,'success');}render();};}
  render();
}
