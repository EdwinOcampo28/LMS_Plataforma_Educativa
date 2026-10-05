// LMS 4.1 Pro utilities: notifications, profiles, calendar, audit, backup and exports.
window.LMSPro = (() => {
  const uid = (prefix='ID') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  const currentAdmin = () => JSON.parse(sessionStorage.getItem('usuarioActivo') || 'null');
  function audit(action, entity, detail='') {
    const logs = LMS.load('auditoria', []);
    logs.unshift({id:uid('AUD'), action, entity, detail, user:currentAdmin()?.email || 'sistema', date:new Date().toISOString()});
    LMS.saveRaw ? LMS.saveRaw('auditoria', logs.slice(0,500)) : localStorage.setItem('auditoria', JSON.stringify(logs.slice(0,500)));
  }
  function notifications() { return LMS.load('notificaciones', []); }
  function notify(title, message, type='info', target='all') {
    const arr = notifications(); arr.unshift({id:uid('NOT'), title, message, type, target, date:new Date().toISOString(), read:false});
    LMS.save('notificaciones', arr.slice(0,200));
  }
  function markRead(id){ const a=notifications(); const n=a.find(x=>x.id===id); if(n)n.read=true; LMS.save('notificaciones',a); }
  function profileKey(){ return currentAdmin()?.email || 'guest'; }
  function download(name, content, mime='text/plain'){ const blob=new Blob([content],{type:mime}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); }
  function exportExcel(filename, headers, rows){ const html=`<html><meta charset="utf-8"><table><tr>${headers.map(h=>`<th>${LMS.escapeHTML(h)}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(v=>`<td>${LMS.escapeHTML(v)}</td>`).join('')}</tr>`).join('')}</table></html>`; download(filename,html,'application/vnd.ms-excel'); }
  function exportCSV(filename, headers, rows){ const esc=v=>`"${String(v??'').replaceAll('"','""')}"`; download(filename,[headers.map(esc),...rows.map(r=>r.map(esc))].map(r=>r.join(';')).join('\n'),'text/csv;charset=utf-8'); }
  function printReport(title, html){ const w=window.open('','_blank'); if(!w)return; w.document.write(`<html><head><title>${LMS.escapeHTML(title)}</title><style>body{font-family:Arial;padding:35px;color:#172033}h1{color:#4f46e5}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:9px;text-align:left}th{background:#eef2ff}</style></head><body><h1>${LMS.escapeHTML(title)}</h1>${html}<script>window.print()<\/script></body></html>`); w.document.close(); }
  function backup(){ const data={version:'4.1',createdAt:new Date().toISOString(),localStorage:{}}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); if(k?.startsWith('lms_')||['cursos','modulos','lecciones','docentes','estudiantes','administrativos','contenidos','misCursos','inscripciones','evaluaciones','calificaciones','certificados','auditoria','notificaciones','eventosCalendario'].includes(k)) data.localStorage[k]=localStorage.getItem(k);} download(`LMS_backup_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2),'application/json'); audit('EXPORTAR','backup','Copia de seguridad descargada'); }
  function restore(file){ const reader=new FileReader(); reader.onload=()=>{try{const data=JSON.parse(reader.result); if(!data.localStorage)throw Error('Formato inválido'); Object.entries(data.localStorage).forEach(([k,v])=>localStorage.setItem(k,v)); audit('IMPORTAR','backup','Copia de seguridad restaurada'); LMS.notify('Copia restaurada correctamente. Recargando…'); setTimeout(()=>location.reload(),900);}catch(e){LMS.notify('La copia no es válida o está dañada.','error')}}; reader.readAsText(file); }
  function badgeType(type){ return type==='success'?'badge-success':type==='warning'?'badge-warning':type==='error'?'badge-danger':'badge-primary'; }
  return {uid,currentAdmin,audit,notifications,notify,markRead,profileKey,exportExcel,exportCSV,printReport,backup,restore,badgeType};
})();
