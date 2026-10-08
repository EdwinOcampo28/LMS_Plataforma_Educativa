# 🎓 EDUNOVA — Plataforma de Aprendizaje y Gestión Académica

Sistema web educativo desarrollado con **HTML5, CSS3 y JavaScript Vanilla**, pensado para funcionar localmente sin backend mediante `LocalStorage`.

## ✨ Mejoras incorporadas

### Arquitectura y mantenimiento
- Separación de utilidades comunes en `js/utils.js`.
- Separación de detalle de curso administrativo y detalle público.
- Protección de las páginas administrativas mediante `authGuard.js`.
- Cierre de sesión real con `logout.js`.
- Manejo seguro de lectura/escritura de `LocalStorage`.
- Sanitización de contenido dinámico antes de insertarlo en HTML.
- Eliminación de lógica duplicada e inconsistencias entre módulos.

### Cursos
- Validación de códigos duplicados.
- Persistencia de categoría.
- Validación de docente y estudiante.
- El código de un curso con módulos/lecciones no puede cambiar accidentalmente.
- No se permite eliminar cursos que tengan módulos o lecciones.
- Mejor visualización del estado y número de módulos.

### Módulos y lecciones
- Prevención de módulos duplicados dentro del mismo curso.
- Al renombrar un módulo, sus lecciones se actualizan automáticamente.
- No se permite borrar módulos que todavía tengan lecciones.
- Validación de campos de lección.
- Contadores de lecciones por módulo.

### Estudiantes y docentes
- Validación de identificaciones/códigos duplicados.
- Búsqueda corregida: editar/eliminar siempre afecta al registro correcto aunque exista un filtro.
- Validaciones de integridad antes de eliminar registros asignados a cursos.

### Administrativos y autenticación
- Validación de identificaciones y correos duplicados.
- Mensajes visuales tipo toast en lugar de depender exclusivamente de `alert()`.
- Protección de rutas administrativas.
- Redirección opcional después del inicio de sesión.

### Vista pública
- Tarjetas modernas y responsive.
- Datos reales del curso, docente, categoría, módulos y lecciones.
- Inscripción persistente mediante `misCursos`.
- Detalle público del curso corregido.
- Eliminadas referencias antiguas como `curso.docente` cuando el modelo usa `docenteNombre`.

### Interfaz
- Rediseño visual con mejor jerarquía, espaciado, sombras, estados y botones.
- Responsive para pantallas pequeñas.
- Tarjetas estadísticas mejoradas.
- Dashboard con gráfica dinámica.
- Estados vacíos amigables.
- Badges de estado.
- Notificaciones visuales.
- Corrección del selector CSS original `bbody` → `body`.

## 📁 Estructura principal

```text
Proyecto_LMS_Edwin_Nicolas/
├── css/
│   └── styles.css
├── img/
│   └── fondo.jpg
├── js/
│   ├── administrativos.js
│   ├── auth.js
│   ├── authGuard.js
│   ├── contenidos.js
│   ├── cursoDetalle.js
│   ├── cursoPublicoDetalle.js
│   ├── cursos.js
│   ├── dashboard.js
│   ├── docentes.js
│   ├── estudiantes.js
│   ├── logout.js
│   ├── publicCursos.js
│   └── utils.js
├── pages/
├── public/
├── curso.html
├── cursopublico.html
├── dashboard.html
├── index.html
└── README.md
```

## 🎓 Cursos demo interactivos

La versión incluye tres cursos de demostración que se crean automáticamente si no existen:

- **WEB-001 — Desarrollo Web desde Cero**: 3 módulos, 9 lecciones y evaluación final de 5 preguntas.
- **PY-001 — Python para Principiantes**: 3 módulos, 9 lecciones y evaluación final de 5 preguntas.
- **SQL-001 — SQL y Bases de Datos desde Cero**: 3 módulos, 9 lecciones y evaluación final de 5 preguntas.

Estudiante demo:
- Identificación: `EST-DEMO-001`

### Flujo completo de aprendizaje

1. Entra al **Portal del Estudiante** con `EST-DEMO-001`.
2. Abre **Catálogo** y elige un curso.
3. Pulsa **Empezar curso**.
4. Abre cada lección y realiza la actividad propuesta.
5. Pulsa **Marcar como completada** para registrar el avance.
6. Completa todas las lecciones para desbloquear la evaluación.
7. Responde la evaluación y obtén mínimo **70%**.
8. El sistema habilita **Obtener certificado**.
9. El certificado queda guardado en **Mis certificados** y puede verificarse mediante su código.

### Contenidos

La administración de contenidos permite asociar recursos externos a un curso (video, documento, imagen o enlace). Los recursos asociados aparecen dentro del detalle público del curso en **Recursos del curso**.

## 🚀 Ejecución

1. Abre `index.html` con un navegador moderno.
2. Entra a **Crear Administrativo** y registra un usuario.
3. Inicia sesión.
4. Desde el Dashboard administra cursos, docentes, estudiantes, contenidos y módulos.
5. La sección **Vista Pública** permite consultar e inscribirse en cursos.

> Para un entorno real, `LocalStorage` y las contraseñas guardadas en el navegador **no son una solución de seguridad**. Para producción se recomienda migrar a backend + base de datos + autenticación segura.

## 💾 Datos locales

El proyecto utiliza las siguientes claves de `LocalStorage`:

- `administrativos`
- `docentes`
- `estudiantes`
- `cursos`
- `modulos`
- `lecciones`
- `contenidos`
- `misCursos`

## 🔧 Próxima evolución recomendada

1. Backend con Node.js/Express.
2. MySQL para persistencia real.
3. Autenticación con sesiones/JWT y contraseñas con hash.
4. Roles: administrador, docente y estudiante.
5. Gestión real de progreso y evaluaciones.
6. Subida de documentos, imágenes y videos.
7. Reportes y certificados.

**Autor:** Edwin Nicolas

## Versión 4.0 — EDUNOVA Académico

- Bootstrap seguro para crear el primer administrador.
- Roles de administrador.
- Portal de estudiante con identificación.
- Inscripciones por estudiante.
- Progreso individual por estudiante y curso.
- Evaluaciones de opción múltiple.
- Calificaciones y promedio.
- Certificados imprimibles al completar curso y aprobar evaluación.
- Reportes académicos.
- Dashboard administrativo ampliado.
- Modo oscuro persistente y mejoras de accesibilidad.

> Nota: esta versión sigue siendo local y utiliza LocalStorage/SessionStorage. Para producción se recomienda migrar autenticación, datos y archivos a una API + base de datos.


## Mejoras de esta versión
- Inscripciones normalizadas: no se cuentan cursos duplicados ni referencias a cursos inexistentes.
- El estudiante puede salir de un curso desde su portal o desde el detalle público.
- Al salir, se conservan progreso y calificaciones para una futura reinscripción.
- Notificaciones con paleta específica para modo oscuro y mejor contraste.
