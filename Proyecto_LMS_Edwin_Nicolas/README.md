# 🎓 LMS - Sistema de Gestión de Cursos

Sistema web tipo **Learning Management System (LMS)** desarrollado con **HTML, CSS y JavaScript puro**, que permite administrar cursos, módulos, lecciones, docentes y administrativos.

El sistema utiliza **LocalStorage** como almacenamiento de datos, lo que permite ejecutar la aplicación completamente en el navegador sin necesidad de backend.

---

# 📚 Descripción del Proyecto

Este proyecto implementa una plataforma educativa básica donde es posible:

* Crear y administrar cursos
* Organizar cursos por módulos
* Crear lecciones dentro de cada módulo
* Gestionar docentes
* Gestionar administrativos
* Visualizar cursos en una **vista pública**
* Monitorear estadísticas desde un **dashboard**

Todo el sistema funciona en el navegador usando **JavaScript y LocalStorage**.

---

# 🧠 Tecnologías Utilizadas

| Tecnología           | Uso                         |
| -------------------- | --------------------------- |
| HTML5                | Estructura de la aplicación |
| CSS3                 | Estilos y diseño moderno    |
| JavaScript (Vanilla) | Lógica del sistema          |
| LocalStorage         | Persistencia de datos       |
| Google Fonts (Inter) | Tipografía moderna          |

---

# 📂 Estructura del Proyecto

```
Proyecto_LMS_Edwin_Nicolas
│
├── css
│   └── styles.css
│
├── js
│   ├── auth.js
│   ├── dashboard.js
│   ├── cursos.js
│   ├── docentes.js
│   ├── administrativos.js
│   └── publicCursos.js
│
├── pages
│   ├── cursos.html
│   ├── docentes.html
│   └── administrativos.html
│
├── public
│   └── cursos.html
│
├── dashboard.html
├── index.html
└── README.md
```

---

# ⚙️ Funcionalidades del Sistema

## 🔐 Autenticación

Archivo:

```
js/auth.js
```

Permite controlar el acceso al sistema mediante login.

Funciones principales:

* Validación de usuario
* Redirección al dashboard
* Cierre de sesión

---

# 📊 Dashboard

Archivo:

```
dashboard.html
js/dashboard.js
```

El dashboard muestra estadísticas generales del sistema.

Incluye:

* Total de cursos
* Total de docentes
* Total de administrativos

También incluye **acciones rápidas** para crear registros rápidamente.

---

# 📚 Gestión de Cursos

Archivo principal:

```
pages/cursos.html
js/cursos.js
```

Permite administrar:

### Cursos

Cada curso contiene:

* Código
* Nombre
* Descripción
* Docente
* Duración
* Etiquetas
* Estado

Funciones disponibles:

* Crear curso
* Editar curso
* Eliminar curso
* Buscar curso
* Mostrar número de módulos

---

# 📦 Gestión de Módulos

Un curso puede contener múltiples módulos.

Cada módulo contiene:

* Curso al que pertenece
* Nombre del módulo

Funciones disponibles:

* Crear módulo
* Editar módulo
* Eliminar módulo
* Mostrar número de lecciones

Validaciones:

* No se puede eliminar un módulo si tiene lecciones.

---

# 📖 Gestión de Lecciones

Las lecciones pertenecen a un módulo y a un curso.

Cada lección contiene:

* Curso
* Módulo
* Título
* Contenido

Funciones disponibles:

* Crear lección
* Editar lección
* Eliminar lección

Validaciones:

* La lección debe pertenecer a un módulo existente.

---

# 👨‍🏫 Gestión de Docentes

Archivo:

```
pages/docentes.html
js/docentes.js
```

Permite:

* Crear docentes
* Editar docentes
* Eliminar docentes

Cada docente tiene:

* Código
* Nombre
* Email
* Especialidad

Validación importante:

Un docente debe existir para poder asignarlo a un curso.

---

# 🧑‍💼 Gestión de Administrativos

Archivo:

```
pages/administrativos.html
js/administrativos.js
```

Permite administrar personal administrativo.

Funciones:

* Crear
* Editar
* Eliminar

---

# 🌍 Vista Pública de Cursos

Archivo:

```
public/cursos.html
js/publicCursos.js
```

Esta sección permite visualizar los cursos disponibles **sin necesidad de acceder al panel administrativo**.

Incluye:

* Tarjetas visuales de cursos
* Nombre del curso
* Docente
* Progreso del curso

Esto simula una **plataforma educativa pública**.

---

# 💾 Almacenamiento de Datos

El sistema utiliza:

```
LocalStorage
```

Las colecciones almacenadas son:

```
cursos
modulos
lecciones
docentes
administrativos
```

Cada colección se guarda como **JSON** en el navegador.

Ejemplo:

```javascript
localStorage.setItem("cursos", JSON.stringify(cursos))
```

---

# 🧩 Lógica de Integridad de Datos

El sistema incluye validaciones importantes:

### Cursos

No se puede eliminar un curso si:

* Tiene módulos
* Tiene lecciones

---

### Módulos

No se puede eliminar un módulo si:

* Tiene lecciones

---

### Lecciones

Una lección solo puede crearse si:

* El curso existe
* El módulo pertenece a ese curso

---

# 🎨 Diseño

El sistema utiliza un diseño moderno con:

* Sidebar de navegación
* Cards modernas
* Tablas limpias
* Responsive design

Archivo principal de estilos:

```
css/styles.css
```

Características:

* Variables CSS
* Tipografía Inter
* Sombras suaves
* Bordes redondeados
* Layout flexible

---

# 🚀 Cómo Ejecutar el Proyecto

1️⃣ Descargar el proyecto

```
git clone repositorio
```

o descargar el ZIP.

---

2️⃣ Abrir el proyecto

Abrir el archivo:

```
index.html
```

en cualquier navegador.

---

3️⃣ Usar el sistema

Desde el login podrás acceder al **Dashboard** y comenzar a administrar cursos.

---

# 🧪 Posibles Mejoras Futuras

Este sistema puede evolucionar fácilmente agregando:

* Base de datos real (MySQL o MongoDB)
* Backend con Node.js
* Autenticación con JWT
* Subida de videos para lecciones
* Progreso real de estudiantes
* Registro de estudiantes
* Sistema de evaluaciones
* Certificados de cursos

---

# 👨‍💻 Autor

Proyecto desarrollado por:

**Edwin Nicolas**

Estudiante de desarrollo de software interesado en:

* Desarrollo web
* Sistemas educativos
* Aplicaciones JavaScript

---

# 📄 Licencia

Este proyecto se puede usar con fines educativos y de aprendizaje.