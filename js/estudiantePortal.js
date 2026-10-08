const login = document.getElementById('studentLogin');
const portal = document.getElementById('studentPortal');
let estudiante = JSON.parse(sessionStorage.getItem('estudianteActivo') || 'null');

function getInscripciones() {
  const raw = LMS.load('inscripciones', {});
  if (!raw || Array.isArray(raw)) return {};
  const cursosValidos = new Set(LMS.load('cursos', []).map(c => c.codigo));
  const clean = {};
  Object.entries(raw).forEach(([studentCode, list]) => {
    const unique = [...new Set(Array.isArray(list) ? list : [])].filter(code => cursosValidos.has(code));
    if (unique.length) clean[studentCode] = unique;
  });
  const changed = JSON.stringify(raw) !== JSON.stringify(clean);
  if (changed) LMS.saveRaw('inscripciones', clean);
  return clean;
}
function saveInscripciones(data){LMS.save('inscripciones',data);}
function lessonId(l){return l.id||`${l.cursoCodigo}::${l.moduloNombre}::${l.titulo}`;}
function progress(code){return LMS.load(`progreso_${estudiante.codigo}_${code}`,[]);}
function isEnrolled(code){return (getInscripciones()[estudiante.codigo]||[]).includes(code);}
function enroll(code){const data=getInscripciones();data[estudiante.codigo]=data[estudiante.codigo]||[];if(!data[estudiante.codigo].includes(code)){data[estudiante.codigo].push(code);saveInscripciones(data);const c=LMS.load('cursos',[]).find(x=>x.codigo===code);LMSPro?.event('INSCRIBIR','curso',`${estudiante.codigo} · ${code}`,'Nueva inscripción',`Te inscribiste en ${c?.nombre||code}.`,'success',estudiante.codigo);if(document.getElementById('misCursos')) renderPortal();}return data;}

function resetStudentLoginUI(){
  const form=login?.querySelector('form');
  const btn=form?.querySelector('button[type=submit]');
  const status=document.getElementById('studentLoginStatus');
  if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-arrow-right"></i> Entrar';}
  if(status){status.classList.remove('is-loading','is-success','is-error');status.innerHTML='<i class="fa-solid fa-lock"></i><span>Listo para ingresar</span>';}
}

function setActiveStudent(e){
  const status=document.getElementById('studentLoginStatus');
  try{
    estudiante=e;
    sessionStorage.setItem('estudianteActivo',JSON.stringify(e));
    LMSPro?.event('INICIAR_SESION','estudiante',e.codigo||e.identificacion,'Inicio de sesión',`Bienvenido, ${e.nombres||e.nombre||e.codigo}.`,'success',e.codigo||e.identificacion||'all');
    // Renderizamos primero: si algo falla, la pantalla de acceso nunca queda atrapada en "Verificando".
    renderPortal();
    // Dejamos visible el estado de éxito unos instantes para que el estudiante
    // vea claramente que su acceso fue confirmado antes de entrar al portal.
    window.setTimeout(()=>{
      login.classList.remove('is-entering');
      login.style.display='none';
      portal.style.display='block';
      portal.classList.remove('is-entering');
      requestAnimationFrame(()=>portal.classList.add('is-entering'));
    }, 650);
  }catch(error){
    console.error('No fue posible abrir el portal del estudiante:',error);
    sessionStorage.removeItem('estudianteActivo');
    estudiante=null;
    portal.style.display='none';
    login.style.display='block';
    resetStudentLoginUI();
    if(status){status.classList.add('is-error');status.innerHTML='<i class="fa-solid fa-circle-exclamation"></i><span>Ocurrió un problema al preparar tu portal. Inténtalo nuevamente.</span>';}
    LMS.notify('No fue posible abrir el portal del estudiante.','error');
  }
}

login?.addEventListener('submit',e=>{
  e.preventDefault();
  const id=document.getElementById('studentId').value.trim();
  const form=e.currentTarget;
  const btn=form.querySelector('button[type=submit]');
  const status=document.getElementById('studentLoginStatus');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';}
  if(status){status.classList.remove('is-error','is-success');status.classList.add('is-loading');status.innerHTML='<i class="fa-solid fa-shield-halved fa-fade"></i><span>Verificando tu acceso...</span>';}
  setTimeout(()=>{
    const found=LMS.load('estudiantes',[]).find(x=>String(x.identificacion)===String(id));
    if(!found){
      resetStudentLoginUI();
      if(status){status.classList.remove('is-loading');status.classList.add('is-error');status.innerHTML='<i class="fa-solid fa-circle-exclamation"></i><span>No encontramos esa identificación. Verifica los datos e inténtalo nuevamente.</span>';}
      LMS.notify('No encontramos un estudiante con esa identificación.','error');
      return;
    }
    if(status){status.classList.remove('is-loading');status.classList.add('is-success');status.innerHTML='<i class="fa-solid fa-circle-check"></i><span>Acceso confirmado. Preparando tu espacio de aprendizaje...</span>';}
    if(btn){btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Accediendo...';}
    setActiveStudent(found);
  },900);
});

document.getElementById('studentLogout')?.addEventListener('click',()=>{
  sessionStorage.removeItem('estudianteActivo');
  estudiante=null;
  portal.style.display='none';
  login.style.display='block';
  login.classList.remove('is-entering');
  resetStudentLoginUI();
  document.getElementById('studentId')?.focus();
});

// Restaurar una sesión activa sin obligar al estudiante a recargar la página.
if(estudiante){
  try{
    renderPortal();
    login.style.display='none';
    portal.style.display='block';
    portal.classList.add('is-entering');
  }catch(error){
    console.error('No fue posible restaurar la sesión del estudiante:',error);
    sessionStorage.removeItem('estudianteActivo');
    estudiante=null;
    login.style.display='block';
    portal.style.display='none';
    resetStudentLoginUI();
  }
}

function courseState(c){
  const lessons=LMS.load('lecciones',[]).filter(l=>l.cursoCodigo===c.codigo);const doneRaw=progress(c.codigo);const done=lessons.filter(l=>doneRaw.includes(lessonId(l))||doneRaw.includes(l.titulo)).length;const pct=lessons.length?Math.round(done/lessons.length*100):0;
  const grades=LMS.load('calificaciones',[]).filter(x=>x.estudianteCodigo===estudiante.codigo&&x.cursoCodigo===c.codigo).sort((a,b)=>Number(b.nota)-Number(a.nota));
  const grade=grades[0];const passed=!!grade&&Number(grade.nota)>=70;const complete=lessons.length>0&&done===lessons.length;const eligible=complete&&passed;
  const allCerts=LMS.load('certificados',[]).filter(x=>x.estudianteCodigo===estudiante.codigo&&x.cursoCodigo===c.codigo);
  const cert=allCerts.find(x=>!(x.revocado||x.status==='revoked'));
  const revokedCert=allCerts.find(x=>x.revocado||x.status==='revoked');
  return {lessons,done,pct,grade,passed,complete,eligible,cert,revokedCert};
}

function salirDelCurso(code){
  const curso=LMS.load('cursos',[]).find(c=>c.codigo===code);
  if(!curso||!estudiante)return;
  const data=getInscripciones();
  const current=data[estudiante.codigo]||[];
  if(!current.includes(code))return;
  LMS.confirmAction(`¿Deseas salir de \"${curso.nombre}\"? Tu progreso y calificaciones se conservarán por si decides volver a inscribirte.`,()=>{
    data[estudiante.codigo]=current.filter(c=>c!==code);
    if(!data[estudiante.codigo].length) delete data[estudiante.codigo];
    saveInscripciones(data);
    LMSPro?.event('SALIR','curso',`${estudiante.codigo} · ${code}`,'Saliste del curso',`Has salido de ${curso.nombre}. Tu progreso se conserva.`,'info',estudiante.codigo);
    LMS.notify(`Saliste de ${curso.nombre}. Tu progreso se conserva.`,'success');
    renderPortal();
  });
}

function renderPortal(){
 if(!estudiante)return;document.getElementById('studentName').textContent=`${estudiante.nombres||''} ${estudiante.apellidos||''}`.trim();
 const mine=getInscripciones()[estudiante.codigo]||[];const cursos=LMS.load('cursos',[]);const container=document.getElementById('misCursos');
 const cards=cursos.filter(c=>mine.includes(c.codigo)).map(c=>{const st=courseState(c);let status=st.cert?'Certificado disponible':st.revokedCert?'Certificado revocado · puedes volver a certificar si cumples los requisitos':st.eligible?'Listo para certificar':st.complete?'Curso completado · falta aprobar evaluación':st.pct>0?`En progreso · ${st.pct}%`:'Aún no iniciado';
 return `<article class="card studentCourse"><span class="badge badge-primary">${LMS.escapeHTML(c.categoria||'Curso')}</span><h3>${LMS.escapeHTML(c.nombre)}</h3><p>${LMS.escapeHTML(c.descripcion||'Sin descripción')}</p><div class="progressBar"><div class="progressFill" style="width:${st.pct}%"></div></div><div class="progressText"><span>${st.done}/${st.lessons.length} lecciones</span><strong>${st.pct}%</strong></div><p class="hint"><i class="fa-solid fa-circle-info"></i> ${LMS.escapeHTML(status)}</p>${st.grade?`<p class="gradeLine"><i class="fa-solid fa-star"></i> Última nota: <strong>${st.grade.nota}%</strong></p>`:''}<div class="courseActions"><button onclick="abrirCursoEstudiante('${LMS.escapeHTML(c.codigo)}')"><i class="fa-solid fa-play"></i> ${st.pct>0?'Continuar curso':'Empezar curso'}</button><button class="btn-outline" ${st.complete?'':'disabled'} onclick="abrirEvaluacion('${LMS.escapeHTML(c.codigo)}')"><i class="fa-solid ${st.complete?'fa-clipboard-check':'fa-lock'}"></i> ${st.complete?'Evaluación':'Completa el curso'}</button>${st.eligible?`<button class="btn-secondary" onclick="emitirCertificado('${LMS.escapeHTML(c.codigo)}')"><i class="fa-solid fa-award"></i> ${st.cert?'Ver certificado':'Obtener certificado'}</button>`:''}<button class="btn-danger btn-sm" onclick="salirDelCurso('${LMS.escapeHTML(c.codigo)}')"><i class="fa-solid fa-arrow-right-from-bracket"></i> Salir del curso</button></div></article>`;}).join('');
 container.innerHTML=cards||LMS.emptyState('Todavía no tienes cursos inscritos. Explora el catálogo para comenzar.');renderEvaluaciones();renderCertificados();renderStats();
}
function renderStats(){const mine=[...new Set(getInscripciones()[estudiante.codigo]||[])];document.getElementById('studentCoursesCount').textContent=mine.length;const enrolled=new Set(mine);const grades=LMS.load('calificaciones',[]).filter(x=>x.estudianteCodigo===estudiante.codigo&&enrolled.has(x.cursoCodigo));document.getElementById('studentAvg').textContent=grades.length?`${Math.round(grades.reduce((s,x)=>s+Number(x.nota||0),0)/grades.length)}%`:'—';document.getElementById('studentCertificates').textContent=LMS.load('certificados',[]).filter(x=>x.estudianteCodigo===estudiante.codigo).length;}
function abrirCursoEstudiante(code){localStorage.setItem('cursoSeleccionado',code);location.href=`cursopublico.html?curso=${encodeURIComponent(code)}`;}
function abrirEvaluacion(code){const c=LMS.load('cursos',[]).find(x=>x.codigo===code);if(!c)return LMS.notify('Curso no encontrado.','error');const st=courseState(c);if(!st.complete)return LMS.notify('Completa todas las lecciones antes de presentar la evaluación.','warning');const evs=LMS.load('evaluaciones',[]).filter(x=>x.cursoCodigo===code);if(!evs.length)return LMS.notify('Este curso todavía no tiene evaluación.','warning');renderQuiz(evs[0]);}
function renderCertificados(){const box=document.getElementById('misCertificados');if(!box)return;const certs=LMS.load('certificados',[]).filter(x=>x.estudianteCodigo===estudiante.codigo);const cursos=LMS.load('cursos',[]);box.innerHTML=certs.length?certs.map(c=>{const curso=cursos.find(x=>x.codigo===c.cursoCodigo);const revoked=Boolean(c.revocado||c.status==='revoked');return `<article class="card certificateCard ${revoked?'certificateRevoked':''}"><div><span class="badge ${revoked?'badge-danger':'badge-success'}"><i class="fa-solid fa-award"></i> ${revoked?'Certificado revocado':'Certificado válido'}</span><h3>${LMS.escapeHTML(curso?.nombre||c.cursoCodigo)}</h3><p>Nota: <strong>${Number(c.nota)||0}%</strong> · Código: <strong>${LMS.escapeHTML(c.id)}</strong></p><small>${new Date(c.fecha).toLocaleDateString('es-CO')}</small></div>${revoked?'':`<button class="btn-secondary" onclick="emitirCertificado('${LMS.escapeHTML(c.cursoCodigo)}')"><i class="fa-solid fa-file-lines"></i> Abrir certificado</button>`}</article>`}).join(''):LMS.emptyState('Todavía no tienes certificados. Completa todas las lecciones y aprueba una evaluación con mínimo 70%.');}
function renderEvaluaciones(){const box=document.getElementById('evaluacionesDisponibles');const mine=getInscripciones()[estudiante.codigo]||[];const ev=LMS.load('evaluaciones',[]).filter(e=>mine.includes(e.cursoCodigo));box.innerHTML=ev.length?ev.map(e=>`<button class="evaluationLink" onclick="renderQuizById('${LMS.escapeHTML(e.id)}')"><span>${LMS.escapeHTML(e.titulo)}</span><small>${e.preguntas?.length||0} preguntas</small></button>`).join(''):LMS.emptyState('No hay evaluaciones disponibles.');}
function renderQuizById(id){const ev=LMS.load('evaluaciones',[]).find(x=>x.id===id);if(ev)renderQuiz(ev);}
function renderQuiz(ev){if(!ev?.preguntas?.length)return LMS.notify('Esta evaluación no tiene preguntas válidas.','error');const box=document.getElementById('quizModal');box.classList.add('open');box.innerHTML=`<div class="quizPanel"><button class="modalClose" onclick="cerrarQuiz()">×</button><span class="badge badge-primary">Evaluación</span><h2>${LMS.escapeHTML(ev.titulo)}</h2><form id="quizForm">${ev.preguntas.map((p,i)=>`<fieldset class="quizQuestion"><legend>${i+1}. ${LMS.escapeHTML(p.texto)}</legend>${p.opciones.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}" required> ${LMS.escapeHTML(o)}</label>`).join('')}</fieldset>`).join('')}<button type="submit"><i class="fa-solid fa-check"></i> Enviar evaluación</button></form></div>`;document.getElementById('quizForm').addEventListener('submit',e=>{e.preventDefault();let correct=0;ev.preguntas.forEach((p,i)=>{if(Number(new FormData(e.target).get(`q${i}`))===Number(p.correcta))correct++;});const nota=Math.round(correct/ev.preguntas.length*100);const grades=LMS.load('calificaciones',[]);grades.push({id:`CAL-${Date.now()}`,evaluacionId:ev.id,cursoCodigo:ev.cursoCodigo,estudianteCodigo:estudiante.codigo,nota,aciertos:correct,total:ev.preguntas.length,fecha:new Date().toISOString()});LMS.save('calificaciones',grades);LMSPro?.event('PRESENTAR','evaluacion',`${ev.titulo} · ${nota}% · ${estudiante.codigo}`,'Evaluación presentada',`Obtuviste ${nota}% en ${ev.titulo}.`,nota>=70?'success':'warning',estudiante.codigo);if(nota>=70)LMSPro?.event('APROBAR','evaluacion',`${ev.titulo} · ${nota}% · ${estudiante.codigo}`,'Evaluación aprobada','¡Felicitaciones! Has aprobado la evaluación.','success',estudiante.codigo);cerrarQuiz();LMS.notify(`Evaluación enviada: ${nota}%`,nota>=70?'success':'warning');renderPortal();});}
function cerrarQuiz(){document.getElementById('quizModal')?.classList.remove('open');}
function emitirCertificado(code){
 const curso=LMS.load('cursos',[]).find(c=>c.codigo===code);
 if(!curso)return LMS.notify('No encontramos el curso.','error');
 const st=courseState(curso);
 if(!st.eligible&&!st.cert)return LMS.notify('Para obtener el certificado debes completar todas las lecciones y aprobar una evaluación con mínimo 70%.','warning');
 const certs=LMS.load('certificados',[]);
 let cert=st.cert;
 if(!cert){
  cert={id:`CERT-${Date.now()}`,estudianteCodigo:estudiante.codigo,cursoCodigo:code,fecha:new Date().toISOString(),nota:st.grade.nota,revocado:false,status:'active'};
  certs.push(cert);LMS.save('certificados',certs);
  LMSPro?.event('GENERAR','certificado',`${cert.id} · ${estudiante.codigo}`,'Certificado obtenido',`Tu certificado de ${curso.nombre} ya está disponible.`,'success',estudiante.codigo);
  LMS.notify('Certificado generado correctamente.','success');
  renderPortal();
 }
 const nombreEstudiante=`${estudiante.nombres||''} ${estudiante.apellidos||''}`.trim();
 const fecha=new Date(cert.fecha).toLocaleDateString('es-CO',{day:'2-digit',month:'long',year:'numeric'});
 const verification=`certificado.html?codigo=${encodeURIComponent(cert.id)}`;
 const w=window.open('','_blank');
 if(!w)return LMS.notify('El navegador bloqueó la ventana del certificado. Permite ventanas emergentes para este sitio.','warning');
 const esc=LMS.escapeHTML;
 w.document.write(`<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>${esc(cert.id)} · Certificado oficial</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>
@page{size:A4 landscape;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:100%;height:100%;background:#dfe4ea}
body{font-family:Georgia,'Times New Roman',serif;color:#182238;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet{width:297mm;height:210mm;background:#fff;position:relative;overflow:hidden;margin:auto;padding:7mm;box-shadow:0 18px 60px rgba(15,23,42,.22)}
.sheet:before{content:'';position:absolute;inset:4mm;border:1.2mm solid #b38a32;pointer-events:none}
.sheet:after{content:'';position:absolute;inset:7mm;border:.35mm solid #d7bd71;pointer-events:none}
.corner{position:absolute;width:34mm;height:34mm;border-color:#b38a32;z-index:2}
.c1{top:9mm;left:9mm;border-top:1mm solid;border-left:1mm solid}.c2{top:9mm;right:9mm;border-top:1mm solid;border-right:1mm solid}.c3{bottom:9mm;left:9mm;border-bottom:1mm solid;border-left:1mm solid}.c4{bottom:9mm;right:9mm;border-bottom:1mm solid;border-right:1mm solid}
.watermark{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);font:900 150px Arial,sans-serif;letter-spacing:-12px;color:rgba(179,138,50,.045);z-index:0}
.content{position:relative;z-index:3;height:100%;display:flex;flex-direction:column;align-items:center;text-align:center;padding:14mm 22mm 10mm}
.brandline{font:800 10px Arial,sans-serif;letter-spacing:5px;color:#806426;text-transform:uppercase;margin-top:1mm}
.brand{font:900 25px Arial,sans-serif;letter-spacing:1px;color:#1d2a44;margin-top:2mm}.brand span{color:#b38a32}
.eyebrow{font:800 9px Arial,sans-serif;letter-spacing:3px;color:#8a93a2;margin-top:3mm;text-transform:uppercase}
.ornament{display:flex;align-items:center;gap:4mm;width:105mm;margin-top:4mm;color:#b38a32}.ornament i{height:.35mm;background:#d4bb76;flex:1}.ornament b{font-size:15px;font-weight:400}
h1{font-size:29px;letter-spacing:2px;font-weight:500;color:#1d2a44;margin:3mm 0 1mm}
.subtitle{font:600 9px Arial,sans-serif;letter-spacing:1.5px;color:#7b8493;text-transform:uppercase}
.name{font-size:30px;font-weight:700;color:#172033;margin:6mm 0 2mm;padding:0 18mm 2mm;border-bottom:.35mm solid #c6a75a;min-width:100mm}
.statement{max-width:190mm;font-size:11px;line-height:1.5;color:#4d586b;margin:2mm 0 3mm}
.course{font-size:21px;font-weight:700;color:#8a6820;max-width:210mm;margin:0 0 3mm}
.meta{display:grid;grid-template-columns:repeat(3,1fr);width:178mm;border-top:.25mm solid #e2d7bb;border-bottom:.25mm solid #e2d7bb;margin-top:2mm;padding:4mm 0;font-family:Arial,sans-serif}
.metric{padding:0 8mm;border-right:.25mm solid #e0d8c7}.metric:last-child{border-right:0}.metric strong{display:block;font-size:15px;color:#24324a;line-height:1.2}.metric small{display:block;margin-top:1.5mm;font-size:7px;letter-spacing:1.3px;color:#8b94a3;text-transform:uppercase}
.bottom{width:178mm;display:grid;grid-template-columns:1fr 34mm 1fr;align-items:end;gap:10mm;margin-top:auto;padding-bottom:2mm}
.signature{border-top:.25mm solid #7f8794;padding-top:2mm;font-family:Arial,sans-serif}.signature strong{display:block;font:600 9px Georgia,serif;color:#24324a}.signature small{display:block;font-size:6.5px;color:#858e9d;margin-top:1mm}
.seal{width:28mm;height:28mm;border:1mm double #b38a32;border-radius:50%;display:grid;place-items:center;color:#8a6820;background:#fffdf7;font:900 7px Arial,sans-serif;line-height:1.25;transform:rotate(-7deg);position:relative}.seal:before{content:'★';position:absolute;top:3mm;font-size:9px}.seal span{padding-top:4mm}.seal em{display:block;font-style:normal;font-size:5px;letter-spacing:1px}
.footer{position:absolute;left:23mm;right:23mm;bottom:8.5mm;display:flex;justify-content:space-between;gap:8mm;font:6px Arial,sans-serif;color:#8a93a1}.footer .code{font-weight:800;color:#5e6879}.verify{color:#6d7480}
.printBar{position:fixed;top:12px;right:12px;background:#172033;color:#fff;padding:10px 14px;border-radius:8px;font:700 11px Arial,sans-serif;z-index:20;box-shadow:0 8px 20px rgba(0,0,0,.18)}
@media print{html,body{background:#fff}.sheet{margin:0;box-shadow:none}.printBar{display:none}}
@media screen and (max-width:900px){body{background:#dfe4ea;padding:10px}.sheet{transform-origin:top left;width:297mm;height:210mm;box-shadow:0 12px 35px rgba(15,23,42,.2)}}
</style></head><body>
<div class="printBar">Certificado oficial · A4 horizontal</div>
<main class="sheet">
<div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div><div class="watermark">EDUNOVA</div>
<section class="content">
<div class="brandline">Plataforma educativa</div><div class="brand">EDUNOVA</div><div class="eyebrow">Certificado académico oficial</div>
<div class="ornament"><i></i><b>✦</b><i></i></div>
<h1>Se certifica que</h1><div class="subtitle">ha cumplido satisfactoriamente los requisitos académicos</div>
<div class="name">${esc(nombreEstudiante)}</div>
<p class="statement">Ha completado satisfactoriamente el programa formativo y aprobado los requisitos establecidos para obtener el certificado correspondiente a:</p>
<div class="course">${esc(curso.nombre)}</div>
<div class="meta"><div class="metric"><strong>${Number(cert.nota)||0}%</strong><small>Calificación final</small></div><div class="metric"><strong>${esc(fecha)}</strong><small>Fecha de emisión</small></div><div class="metric"><strong>${esc(curso.codigo)}</strong><small>Código del curso</small></div></div>
<div class="bottom"><div class="signature"><strong>Autoridad académica</strong><small>Plataforma Educativa EDUNOVA</small></div><div class="seal"><span>★<br>EDUNOVA<em>VERIFICADO</em></span></div><div class="signature"><strong>Registro académico</strong><small>Documento emitido y verificable digitalmente</small></div></div>
</section>
<div class="footer"><span class="code">Código: ${esc(cert.id)}</span><span class="verify">Verificación: ${esc(verification)}</span><span>Documento oficial · EDUNOVA · 2026</span></div>
</main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),500))<\/script></body></html>`);
 w.document.close();
}
