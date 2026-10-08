// Servicios transversales del LMS: auditoría, notificaciones, perfiles, respaldos y exportaciones.
window.LMSPro = (() => {
  const uid = (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const readJSON = (key, fallback = null) => { try { return JSON.parse(sessionStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const currentAdmin = () => readJSON('usuarioActivo');
  const currentStudent = () => readJSON('estudianteActivo');
  const actor = () => currentAdmin()?.email || currentStudent()?.identificacion || currentStudent()?.codigo || 'sistema';

  function audit(action, entity, detail = '') {
    const logs = LMS.load('auditoria', []);
    const record = { id: uid('AUD'), action, entity, detail, user: actor(), date: new Date().toISOString() };
    logs.unshift(record);
    LMS.saveRaw('auditoria', logs.slice(0, 500));
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'auditoria', value: logs } }));
    return record;
  }

  function notifications() { return LMS.load('notificaciones', []); }
  function deletedNotificationAuditIds() { return new Set(LMS.load('notificacionesEliminadas', [])); }
  function rememberDeletedNotifications(items) {
    const current = LMS.load('notificacionesEliminadas', []);
    const ids = items.map(n => n?.sourceAuditId).filter(Boolean);
    if (!ids.length) return;
    const next = [...new Set([...current, ...ids])].slice(-1000);
    LMS.saveRaw('notificacionesEliminadas', next);
  }
  function notify(title, message, type = 'info', target = 'all') {
    const arr = notifications();
    arr.unshift({ id: uid('NOT'), title, message, type, target, date: new Date().toISOString(), read: false });
    const next = arr.slice(0, 200);
    LMS.saveRaw('notificaciones', next);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: next } }));
    return next[0];
  }

  // Registra una acción y, si corresponde, genera el aviso asociado.
  function event(action, entity, detail, title, message, type = 'info', target = 'all') {
    const record = audit(action, entity, detail);
    if (title && message) {
      const created = notify(title, message, type, target);
      const arr = notifications().map(n => n.id === created?.id ? { ...n, sourceAuditId: record?.id || null } : n);
      LMS.saveRaw('notificaciones', arr);
      window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: arr } }));
      return created;
    }
    return record;
  }

  function backfillFromAudit() {
    const important = new Set(['INICIAR_SESION','INSCRIBIR','SALIR','COMPLETAR','PRESENTAR','APROBAR','GENERAR','REVOCAR','RESTAURAR','ELIMINAR','ELIMINAR_MASIVO','EXPORTAR','IMPORTAR']);
    const existing = notifications();
    const linked = new Set(existing.map(n => n.sourceAuditId).filter(Boolean));
    const deleted = deletedNotificationAuditIds();
    const logs = LMS.load('auditoria', []).filter(a => important.has(a.action) && !linked.has(a.id) && !deleted.has(a.id)).slice(0, 20);
    if (!logs.length) return existing;
    const typeFor = a => ['APROBAR','GENERAR','RESTAURAR','COMPLETAR'].includes(a.action) ? 'success' : ['REVOCAR','ELIMINAR','ELIMINAR_MASIVO'].includes(a.action) ? 'warning' : a.action === 'PRESENTAR' ? 'info' : 'info';
    const titleFor = a => ({INICIAR_SESION:'Inicio de sesión',INSCRIBIR:'Nueva inscripción',SALIR:'Salida de curso',COMPLETAR:'Lección completada',PRESENTAR:'Evaluación presentada',APROBAR:'Evaluación aprobada',GENERAR:'Certificado generado',REVOCAR:'Certificado revocado',RESTAURAR:'Certificado restaurado',ELIMINAR:'Registro eliminado',ELIMINAR_MASIVO:'Registros eliminados',EXPORTAR:'Respaldo creado',IMPORTAR:'Respaldo restaurado'}[a.action] || 'Actividad del sistema');
    const next = [...existing];
    logs.reverse().forEach(a => next.unshift({ id: uid('NOT'), title: titleFor(a), message: a.detail || `Se realizó la acción ${a.action}.`, type: typeFor(a), target: a.user || 'all', date: a.date, read: false, sourceAuditId: a.id }));
    const trimmed = next.slice(0, 200);
    LMS.saveRaw('notificaciones', trimmed);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: trimmed } }));
    return trimmed;
  }

  function unreadCount() { return notifications().filter(n => !n.read).length; }
  function markRead(id) {
    const next = notifications().map(n => String(n.id) === String(id) ? { ...n, read: true } : n);
    LMS.saveRaw('notificaciones', next);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: next } }));
  }
  function markAllRead() {
    const next = notifications().map(n => ({ ...n, read: true }));
    LMS.saveRaw('notificaciones', next);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: next } }));
  }
  function removeRead(id) {
    const current = notifications();
    const item = current.find(n => String(n.id) === String(id));
    if (!item || !item.read) return false;
    const next = current.filter(n => String(n.id) !== String(id));
    rememberDeletedNotifications([item]);
    LMS.saveRaw('notificaciones', next);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: next } }));
    return true;
  }
  function removeAllRead() {
    const current = notifications();
    rememberDeletedNotifications(current.filter(n => n.read));
    const next = current.filter(n => !n.read);
    LMS.saveRaw('notificaciones', next);
    window.dispatchEvent(new CustomEvent('lms:data-change', { detail: { key: 'notificaciones', value: next } }));
    return next.length;
  }

  function profileKey() { return currentAdmin()?.email || currentStudent()?.codigo || 'guest'; }
  function download(name, content, mime = 'text/plain') { const blob = new Blob([content], { type: mime }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500); }
  function exportExcel(filename, headers, rows, title = 'Reporte académico') {
    const now = new Date().toLocaleString('es-CO');
    const escXml = value => String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&apos;');
    const sheetRows = [
      `<Row><Cell ss:MergeAcross="${Math.max(headers.length - 1, 0)}" ss:StyleID="Title"><Data ss:Type="String">${escXml(title)}</Data></Cell></Row>`,
      `<Row><Cell ss:MergeAcross="${Math.max(headers.length - 1, 0)}" ss:StyleID="Brand"><Data ss:Type="String">EDUNOVA · Plataforma de aprendizaje y gestión académica</Data></Cell></Row>`,
      `<Row><Cell ss:MergeAcross="${Math.max(headers.length - 1, 0)}" ss:StyleID="Meta"><Data ss:Type="String">Generado: ${escXml(now)}</Data></Cell></Row>`,
      `<Row>${headers.map(h => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escXml(h)}</Data></Cell>`).join('')}</Row>`,
      ...rows.map(row => `<Row>${row.map(v => {
        const n = Number(v);
        const isNumber = v !== '' && v !== null && v !== '—' && Number.isFinite(n);
        return `<Cell ss:StyleID="${isNumber ? 'Number' : 'Cell'}"><Data ss:Type="${isNumber ? 'Number' : 'String'}">${escXml(v)}</Data></Cell>`;
      }).join('')}</Row>`)
    ];
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>EDUNOVA</Author><Title>${escXml(title)}</Title><Created>${new Date().toISOString()}</Created></DocumentProperties>
  <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"><ProtectStructure>False</ProtectStructure></ExcelWorkbook>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos" ss:Size="10"/><Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/><NumberFormat ss:Format="General"/></Style>
    <Style ss:ID="Title"><Font ss:FontName="Aptos Display" ss:Size="18" ss:Bold="1" ss:Color="#173B6C"/><Alignment ss:Vertical="Center"/><Interior ss:Color="#F4F7FB" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Brand"><Font ss:FontName="Aptos" ss:Size="10" ss:Bold="1" ss:Color="#B48619"/></Style>
    <Style ss:ID="Meta"><Font ss:FontName="Aptos" ss:Size="9" ss:Color="#667085"/><Alignment ss:Vertical="Center"/></Style>
    <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#173B6C" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B48619"/></Borders></Style>
    <Style ss:ID="Cell"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders><Alignment ss:Vertical="Center"/></Style>
    <Style ss:ID="Number"><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/></Borders><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="0"/></Style>
  </Styles>
  <Worksheet ss:Name="Reporte"><Table ss:ExpandedColumnCount="${headers.length}" ss:ExpandedRowCount="${sheetRows.length}" x:FullColumns="1" x:FullRows="1">${sheetRows.join('')}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>4</SplitHorizontal><TopRowBottomPane>4</TopRowBottomPane><AutoFilter x:Range="R4C1:R${Math.max(sheetRows.length,4)}C${headers.length}"/><Print><ValidPrinterInfo/><HorizontalResolution>600</HorizontalResolution><VerticalResolution>600</VerticalResolution><PaperSizeIndex>9</PaperSizeIndex><FitWidth>1</FitWidth><FitHeight>0</FitHeight><HorizontalCentered/></Print></WorksheetOptions></Worksheet>
</Workbook>`;
    download(filename.replace(/\.xlsx?$/i, '.xls'), xml, 'application/vnd.ms-excel;charset=utf-8');
  }
  function exportCSV(filename, headers, rows, title = 'Reporte académico') {
    const esc = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const bom = '\ufeff';
    const meta = [`EDUNOVA - ${title}`, `Generado: ${new Date().toLocaleString('es-CO')}`].map(esc).join(';');
    const csv = [meta, '', headers.map(esc).join(';'), ...rows.map(r => r.map(esc).join(';'))].join('\r\n');
    download(filename, bom + csv, 'text/csv;charset=utf-8');
  }
  function printReport(title, html) {
    const w = window.open('', '_blank'); if (!w) return;
    const now = new Date().toLocaleString('es-CO');
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${LMS.escapeHTML(title)} · EDUNOVA</title><style>
      @page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font-family:Inter,Arial,sans-serif;color:#172033;margin:0;background:#fff;font-size:11px}
      .header{border:1px solid #d8dee9;border-top:5px solid #173b6c;border-radius:10px;padding:14px 18px;margin-bottom:16px;background:linear-gradient(135deg,#f8fafc,#fff)}
      .brand{font-size:13px;font-weight:900;letter-spacing:3px;color:#b48619}.header h1{margin:4px 0 2px;color:#173b6c;font-size:23px}.header p{margin:0;color:#667085;font-size:11px}.meta{margin-top:6px;color:#7a8494;font-size:10px}
      .reportIntro{display:flex;justify-content:space-between;gap:12px;margin:0 0 12px}.pill{border:1px solid #d8dee9;border-radius:999px;padding:5px 9px;color:#526071;background:#f8fafc;font-size:10px}
      table{width:100%;border-collapse:separate;border-spacing:0;margin-top:10px;font-size:10px;border:1px solid #d9dee7;border-radius:8px;overflow:hidden}th{background:#173b6c;color:#fff;padding:8px;text-align:left;font-weight:700}td{border-top:1px solid #e4e8ef;padding:7px 8px;vertical-align:top}tbody tr:nth-child(even) td{background:#f8fafc}tbody tr:hover td{background:#eef4fb}
      .footer{margin-top:18px;padding-top:8px;border-top:1px solid #d9dee7;font-size:9px;color:#7a8494;display:flex;justify-content:space-between}.noPrint{display:none!important}
      @media print{a{color:inherit;text-decoration:none}}
    </style></head><body><header class="header"><div class="brand">EDUNOVA</div><h1>${LMS.escapeHTML(title)}</h1><p>Plataforma de aprendizaje y gestión académica · Reporte oficial</p><div class="meta">Generado: ${LMS.escapeHTML(now)}</div></header>${html}<footer class="footer"><span>EDUNOVA · Documento oficial</span><span>Generado digitalmente · ${LMS.escapeHTML(now)}</span></footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),450))<\/script></body></html>`);
    w.document.close();
  }
  function backup() { const data = { version: '4.2', createdAt: new Date().toISOString(), localStorage: {} }; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith('lms_') || ['cursos','modulos','lecciones','docentes','estudiantes','administrativos','contenidos','misCursos','inscripciones','evaluaciones','calificaciones','certificados','auditoria','notificaciones','eventosCalendario'].includes(k)) data.localStorage[k] = localStorage.getItem(k); } download(`EDUNOVA_backup_${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(data, null, 2), 'application/json'); event('EXPORTAR', 'backup', 'Copia de seguridad descargada', 'Respaldo creado', 'Se descargó una copia de seguridad del sistema EDUNOVA.', 'success'); }
  function restore(file) { const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(reader.result); if (!data.localStorage) throw Error('Formato inválido'); Object.entries(data.localStorage).forEach(([k,v]) => localStorage.setItem(k,v)); event('IMPORTAR', 'backup', 'Copia de seguridad restaurada', 'Respaldo restaurado', 'La copia de seguridad fue restaurada correctamente.', 'success'); LMS.notify('Copia restaurada correctamente. Recargando…'); setTimeout(() => location.reload(), 900); } catch { LMS.notify('La copia no es válida o está dañada.', 'error'); } }; reader.readAsText(file); }
  function badgeType(type) { return type === 'success' ? 'badge-success' : type === 'warning' ? 'badge-warning' : type === 'error' ? 'badge-danger' : 'badge-primary'; }

  return { uid, currentAdmin, currentStudent, actor, audit, event, backfillFromAudit, notifications, unreadCount, notify, markRead, markAllRead, removeRead, removeAllRead, profileKey, exportExcel, exportCSV, printReport, backup, restore, badgeType };
})();
