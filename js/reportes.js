// Reportes académicos: métricas, rendimiento, calificaciones y control de certificados.
function getReportData() {
  const cursos = LMS.load('cursos', []);
  const estudiantes = LMS.load('estudiantes', []);
  const evaluaciones = LMS.load('evaluaciones', []);
  const calificaciones = LMS.load('calificaciones', []);
  const certificados = LMS.load('certificados', []);
  const inscripciones = LMS.load('inscripciones', {});

  // Normaliza las inscripciones para que un mismo curso no se cuente dos veces.
  const activePairs = new Set();
  Object.entries(inscripciones || {}).forEach(([studentCode, courseCodes]) => {
    if (!Array.isArray(courseCodes)) return;
    [...new Set(courseCodes)].forEach(courseCode => {
      if (cursos.some(c => c.codigo === courseCode)) activePairs.add(`${studentCode}::${courseCode}`);
    });
  });

  const average = calificaciones.length
    ? Math.round(calificaciones.reduce((sum, item) => sum + Number(item.nota || 0), 0) / calificaciones.length)
    : null;

  return { cursos, estudiantes, evaluaciones, calificaciones, certificados, activePairs, average };
}

function renderReportes() {
  const data = getReportData();
  const { cursos, estudiantes, evaluaciones, calificaciones, certificados, activePairs, average } = data;

  const activeCertificates = certificados.filter(c => !(c.revocado || c.status === 'revoked')).length;
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

  setText('rInscripciones', activePairs.size);
  setText('rEvaluaciones', calificaciones.length);
  setText('rPromedio', average === null ? '—' : `${average}%`);
  setText('rCertificados', activeCertificates);

  const cursosBody = document.getElementById('reporteCursos');
  if (cursosBody) {
    cursosBody.innerHTML = cursos.length
      ? cursos.map(curso => {
          const enrolled = [...activePairs].filter(pair => pair.endsWith(`::${curso.codigo}`)).length;
          const courseGrades = calificaciones.filter(g => g.cursoCodigo === curso.codigo);
          const approved = courseGrades.filter(g => Number(g.nota) >= 70).length;
          const avg = courseGrades.length
            ? Math.round(courseGrades.reduce((sum, g) => sum + Number(g.nota || 0), 0) / courseGrades.length)
            : null;
          const evaluations = evaluaciones.filter(e => e.cursoCodigo === curso.codigo).length;
          return `
            <tr>
              <td><div class="reportCourseName"><strong>${LMS.escapeHTML(curso.nombre)}</strong><small>${LMS.escapeHTML(curso.categoria || 'Sin categoría')}</small></div></td>
              <td><strong>${enrolled}</strong></td>
              <td>${evaluations}</td>
              <td><span class="badge ${avg === null ? 'badge-muted' : avg >= 70 ? 'badge-success' : 'badge-warning'}">${avg === null ? 'Sin datos' : `${avg}%`}</span></td>
              <td>${approved}</td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="5">${LMS.emptyState('No hay cursos para reportar.')}</td></tr>`;
  }

  const gradesBody = document.getElementById('reporteNotas');
  if (gradesBody) {
    const latest = calificaciones.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);
    gradesBody.innerHTML = latest.length
      ? latest.map(g => {
          const student = estudiantes.find(x => x.codigo === g.estudianteCodigo || x.identificacion === g.estudianteCodigo);
          const curso = cursos.find(x => x.codigo === g.cursoCodigo);
          const studentName = student?.nombre || `${student?.nombres || ''} ${student?.apellidos || ''}`.trim() || g.estudianteCodigo;
          const grade = Number(g.nota || 0);
          return `
            <tr>
              <td><div class="reportPerson"><strong>${LMS.escapeHTML(studentName)}</strong><small>${LMS.escapeHTML(g.estudianteCodigo || '')}</small></div></td>
              <td>${LMS.escapeHTML(curso?.nombre || g.cursoCodigo)}</td>
              <td><span class="badge ${grade >= 70 ? 'badge-success' : 'badge-warning'}">${grade}%</span></td>
              <td>${new Date(g.fecha).toLocaleDateString('es-CO')}</td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="4">${LMS.emptyState('Todavía no hay calificaciones.')}</td></tr>`;
  }

  renderCertificadosReport();
}

function exportRows() {
  const { cursos, calificaciones, activePairs } = getReportData();
  return cursos.map(curso => {
    const inscritos = [...activePairs].filter(pair => pair.endsWith(`::${curso.codigo}`)).length;
    const grades = calificaciones.filter(g => g.cursoCodigo === curso.codigo);
    const average = grades.length
      ? Math.round(grades.reduce((sum, g) => sum + Number(g.nota || 0), 0) / grades.length)
      : '—';
    const approved = grades.filter(g => Number(g.nota) >= 70).length;
    return [curso.nombre, inscritos, grades.length, average, approved];
  });
}

function exportarExcel() {
  LMSPro.exportExcel(`EDUNOVA_Reporte_Cursos_${new Date().toISOString().slice(0,10)}.xls`, ['Curso', 'Inscritos activos', 'Entregas evaluativas', 'Promedio', 'Aprobados'], exportRows(), 'Reporte académico por curso');
  LMSPro.audit('EXPORTAR', 'reportes', 'Excel');
}

function exportarCSV() {
  LMSPro.exportCSV(`EDUNOVA_Reporte_Cursos_${new Date().toISOString().slice(0,10)}.csv`, ['Curso', 'Inscritos activos', 'Entregas evaluativas', 'Promedio', 'Aprobados'], exportRows(), 'Reporte académico por curso');
  LMSPro.audit('EXPORTAR', 'reportes', 'CSV');
}

function exportarPDF() {
  const data = getReportData();
  const rows = exportRows().map(row => `<tr>${row.map(value => `<td>${LMS.escapeHTML(value)}</td>`).join('')}</tr>`).join('');
  const latest = data.calificaciones.slice().sort((a,b) => new Date(b.fecha)-new Date(a.fecha)).slice(0,8).map(g => {
    const student = data.estudiantes.find(x => x.codigo === g.estudianteCodigo || x.identificacion === g.estudianteCodigo);
    const curso = data.cursos.find(x => x.codigo === g.cursoCodigo);
    const name = student?.nombre || `${student?.nombres || ''} ${student?.apellidos || ''}`.trim() || g.estudianteCodigo;
    return `<tr><td>${LMS.escapeHTML(name)}</td><td>${LMS.escapeHTML(curso?.nombre || g.cursoCodigo)}</td><td>${Number(g.nota || 0)}%</td><td>${new Date(g.fecha).toLocaleDateString('es-CO')}</td></tr>`;
  }).join('');
  const activeCertificates = data.certificados.filter(c => !(c.revocado || c.status === 'revoked')).length;
  const summary = `<div class="reportIntro"><span class="pill"><strong>${data.activePairs.size}</strong> inscripciones activas</span><span class="pill"><strong>${data.calificaciones.length}</strong> entregas evaluativas</span><span class="pill"><strong>${data.average === null ? '—' : data.average + '%'}</strong> promedio general</span><span class="pill"><strong>${activeCertificates}</strong> certificados vigentes</span></div>`;
  const html = `${summary}<h2 style="color:#173b6c;font-size:15px;margin:14px 0 6px">Rendimiento por curso</h2><table><thead><tr><th>Curso</th><th>Inscritos</th><th>Evaluaciones</th><th>Promedio</th><th>Aprobados</th></tr></thead><tbody>${rows || '<tr><td colspan="5">Sin datos</td></tr>'}</tbody></table><h2 style="color:#173b6c;font-size:15px;margin:18px 0 6px">Últimas calificaciones</h2><table><thead><tr><th>Estudiante</th><th>Curso</th><th>Nota</th><th>Fecha</th></tr></thead><tbody>${latest || '<tr><td colspan="4">Sin calificaciones</td></tr>'}</tbody></table>`;
  LMSPro.printReport('Reporte académico general', html);
  LMSPro.audit('EXPORTAR', 'reportes', 'PDF');
}
function renderCertificadosReport() {
  const box = document.getElementById('reporteCertificados');
  if (!box) return;

  const certificados = LMS.load('certificados', []);
  const estudiantes = LMS.load('estudiantes', []);
  const cursos = LMS.load('cursos', []);

  box.innerHTML = certificados.length
    ? certificados.map(cert => {
        const student = estudiantes.find(x => x.codigo === cert.estudianteCodigo || x.identificacion === cert.estudianteCodigo);
        const curso = cursos.find(x => x.codigo === cert.cursoCodigo);
        const nombre = student?.nombre || `${student?.nombres || ''} ${student?.apellidos || ''}`.trim() || cert.estudianteCodigo;
        const revoked = Boolean(cert.revocado || cert.status === 'revoked');
        const status = revoked
          ? '<span class="badge badge-danger">Revocado</span>'
          : '<span class="badge badge-success">Vigente</span>';
        const action = revoked
          ? `<button class="btn-secondary btn-sm" onclick="restaurarCertificado('${LMS.escapeHTML(cert.id)}')"><i class="fa-solid fa-rotate-left"></i> Restaurar</button> <button class="btn-danger btn-sm" onclick="eliminarCertificado('${LMS.escapeHTML(cert.id)}')"><i class="fa-solid fa-trash"></i> Eliminar</button>`
          : `<button class="btn-danger btn-sm" onclick="revocarCertificado('${LMS.escapeHTML(cert.id)}')"><i class="fa-solid fa-ban"></i> Revocar</button>`;

        return `<tr>
          <td><strong>${LMS.escapeHTML(cert.id)}</strong></td>
          <td>${LMS.escapeHTML(nombre)}</td>
          <td>${LMS.escapeHTML(curso?.nombre || cert.cursoCodigo)}</td>
          <td><span class="badge ${Number(cert.nota) >= 70 ? 'badge-success' : 'badge-warning'}">${Number(cert.nota) || 0}%</span></td>
          <td>${new Date(cert.fecha).toLocaleDateString('es-CO')}</td>
          <td>${status}</td>
          <td>${action}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7">${LMS.emptyState('No hay certificados emitidos.')}</td></tr>`;
}

function revocarCertificado(id) {
  const list = LMS.load('certificados', []);
  const index = list.findIndex(item => String(item.id) === String(id));
  if (index < 0) return;
  LMS.confirmAction(`¿Revocar el certificado ${id}? El progreso y la nota se conservarán.`, () => {
    list[index] = { ...list[index], revocado: true, status: 'revoked', revocadoEn: new Date().toISOString(), revocadoPor: LMSPro.actor() };
    LMS.saveRaw('certificados', list);
    LMSPro.event('REVOCAR', 'certificado', id, 'Certificado revocado', `El certificado ${id} fue revocado.`, 'warning', 'all');
    renderReportes();
    LMS.notify('Certificado revocado.', 'warning');
  });
}

function restaurarCertificado(id) {
  const list = LMS.load('certificados', []);
  const index = list.findIndex(item => String(item.id) === String(id));
  if (index < 0) return;
  LMS.confirmAction(`¿Restaurar el certificado ${id}?`, () => {
    list[index] = { ...list[index], revocado: false, status: 'active', restauradoEn: new Date().toISOString(), restauradoPor: LMSPro.actor() };
    LMS.saveRaw('certificados', list);
    LMSPro.event('RESTAURAR', 'certificado', id, 'Certificado restaurado', `El certificado ${id} volvió a estar vigente.`, 'success', 'all');
    renderReportes();
    LMS.notify('Certificado restaurado.', 'success');
  });
}

function eliminarCertificado(id) {
  const list = LMS.load('certificados', []);
  const cert = list.find(item => String(item.id) === String(id));
  if (!cert) return;
  if (!cert.revocado && cert.status !== 'revoked') return LMS.notify('Revoca el certificado antes de eliminarlo permanentemente.', 'warning');

  LMS.confirmAction(`¿Eliminar permanentemente el certificado ${id}? Esta acción no borra notas ni progreso.`, () => {
    LMS.saveRaw('certificados', list.filter(item => String(item.id) !== String(id)));
    LMSPro.event('ELIMINAR', 'certificado', id, 'Certificado eliminado', `Se eliminó permanentemente el certificado ${id}.`, 'warning', 'all');
    renderReportes();
    LMS.notify('Certificado eliminado permanentemente.', 'warning');
  });
}

function eliminarTodosCertificados() {
  const list = LMS.load('certificados', []);
  const revoked = list.filter(item => item.revocado || item.status === 'revoked');
  if (!revoked.length) return LMS.notify('No hay certificados revocados para eliminar.', 'warning');

  LMS.confirmAction(`¿Eliminar permanentemente los ${revoked.length} certificados revocados? Los vigentes no se eliminarán.`, () => {
    LMS.saveRaw('certificados', list.filter(item => !(item.revocado || item.status === 'revoked')));
    LMSPro.event('ELIMINAR_MASIVO', 'certificados', `Eliminados: ${revoked.length}`, 'Certificados eliminados', `Se eliminaron ${revoked.length} certificados revocados.`, 'warning', 'all');
    renderReportes();
    LMS.notify('Certificados revocados eliminados.', 'warning');
  });
}

renderReportes();
window.addEventListener('lms:data-change', renderReportes);
