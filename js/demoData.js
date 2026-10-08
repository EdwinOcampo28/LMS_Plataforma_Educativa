(function seedDemoData(){
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const load = (key, fallback=[]) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const courses = load('cursos', []);
  const demoCodes = ['WEB-001','PY-001','SQL-001'];
  if (demoCodes.every(code => courses.some(c => c.codigo === code))) return;

  const docentes = load('docentes', []);
  if (!docentes.some(d => d.codigo === 'DOC-DEMO-001')) {
    docentes.push({codigo:'DOC-DEMO-001',nombre:'Laura Martínez',email:'laura.demo@lms.local',especialidad:'Tecnología'});
    save('docentes',docentes);
  }
  const estudiantes = load('estudiantes', []);
  if (!estudiantes.some(e => e.identificacion === 'EST-DEMO-001')) {
    estudiantes.push({codigo:'EST-DEMO-001',identificacion:'EST-DEMO-001',nombres:'Carlos',apellidos:'Demo',email:'estudiante.demo@lms.local'});
    save('estudiantes',estudiantes);
  }

  const defs = [
    {
      codigo:'WEB-001', nombre:'Desarrollo Web desde Cero', categoria:'Tecnología', duracion:'12 horas', etiquetas:'HTML, CSS, JavaScript',
      descripcion:'Curso práctico para construir una página web desde cero y entender la base del desarrollo frontend.',
      modules:[
        ['HTML y estructura',[['Tu primera página HTML','Aprende qué es HTML, cómo funciona un documento y cómo crear una estructura semántica básica.','Actividad: crea una página con título, párrafos, una lista y un enlace.'],['Etiquetas y formularios','Conoce encabezados, enlaces, imágenes, tablas y formularios para capturar información.','Actividad: crea un formulario de registro con nombre, correo y contraseña.'],['HTML semántico','Organiza una página con header, nav, main, section, article y footer para mejorar estructura y accesibilidad.','Actividad: transforma una página con divs en una estructura semántica.']]],
        ['CSS y diseño',[['Selectores y estilos','Aprende a seleccionar elementos y aplicar color, tipografía, bordes y espaciado.','Actividad: diseña una tarjeta de perfil con al menos cinco propiedades CSS.'],['Flexbox y responsive','Usa Flexbox y media queries para crear interfaces que se adapten a diferentes pantallas.','Actividad: construye una fila de tarjetas que pase a una columna en móvil.'],['Diseño visual','Combina sombras, bordes, variables y estados hover para crear una interfaz moderna.','Actividad: crea un botón con hover y una tarjeta con sombra.']]],
        ['JavaScript básico',[['Variables y tipos','Comprende let, const, strings, números, booleanos y operaciones básicas.','Actividad: crea variables para nombre, edad y ciudad y muéstralas en consola.'],['Funciones y eventos','Aprende a crear funciones y reaccionar a clics y eventos del navegador.','Actividad: crea un botón que cambie el texto de un elemento al hacer clic.'],['Proyecto final web','Integra HTML, CSS y JavaScript en una pequeña página interactiva.','Actividad: crea una mini ficha de producto con botón de interacción.']]]
      ],
      quiz:[['¿Qué lenguaje define la estructura de una página web?',['HTML','CSS','SQL','Python'],0],['¿Qué tecnología se usa principalmente para estilos?',['HTML','CSS','JSON','Git'],1],['¿Qué propiedad permite usar Flexbox?',['display','position','font','border'],0],['¿Qué palabra declara una constante en JavaScript?',['var','const','letx','static'],1],['¿Qué evento detecta normalmente un clic?',['hover','click','submitx','press'],1]]
    },
    {
      codigo:'PY-001', nombre:'Python para Principiantes', categoria:'Tecnología', duracion:'10 horas', etiquetas:'Python, Programación, Lógica',
      descripcion:'Aprende los fundamentos de Python mediante ejercicios sencillos y una práctica final.',
      modules:[
        ['Fundamentos',[['Instalación y primer programa','Conoce Python, ejecuta tu primer programa y comprende la función print.','Actividad: escribe un programa que salude usando tu nombre.'],['Variables y datos','Trabaja con variables, strings, números y booleanos.','Actividad: crea un pequeño perfil usando tres tipos de datos.'],['Operadores','Usa operadores aritméticos, comparativos y lógicos para construir expresiones.','Actividad: calcula el precio final de un producto con descuento.']]],
        ['Control de flujo',[['Condicionales','Usa if, elif y else para tomar decisiones en un programa.','Actividad: crea un programa que determine si una persona es mayor de edad.'],['Bucles','Repite instrucciones con for y while de forma controlada.','Actividad: muestra los números del 1 al 10 y calcula su suma.'],['Listas y diccionarios','Organiza información con colecciones y accede a sus elementos.','Actividad: crea una lista de cursos y un diccionario de estudiante.']]],
        ['Funciones y proyecto',[['Funciones','Encapsula lógica reutilizable mediante funciones y parámetros.','Actividad: crea una función que calcule el área de un rectángulo.'],['Manejo de errores','Usa try y except para controlar errores esperables.','Actividad: valida que una entrada numérica no provoque un error.'],['Proyecto final Python','Integra variables, condiciones, bucles y funciones en un pequeño programa.','Actividad: crea un menú de consola para gestionar una lista de tareas.']]]
      ],
      quiz:[['¿Qué función imprime información en Python?',['print()','show()','echo()','write()'],0],['¿Qué palabra se usa para una condición?',['if','when','case','check'],0],['¿Qué colección mantiene pares clave-valor?',['list','tuple','dict','setx'],2],['¿Qué palabra inicia una función?',['func','def','function','lambda'],1],['¿Qué bloque captura errores?',['try/except','catch/finally','error/handle','safe'],0]]
    },
    {
      codigo:'SQL-001', nombre:'SQL y Bases de Datos desde Cero', categoria:'Tecnología', duracion:'9 horas', etiquetas:'SQL, MySQL, Datos',
      descripcion:'Aprende a consultar y modificar datos con SQL y entiende las operaciones esenciales de una base de datos.',
      modules:[
        ['Fundamentos SQL',[['Tablas y registros','Comprende tablas, filas, columnas, claves y relaciones básicas.','Actividad: diseña una tabla estudiantes con id, nombre y correo.'],['SELECT y WHERE','Consulta información y filtra registros según condiciones.','Actividad: escribe consultas para obtener estudiantes activos.'],['ORDER BY y LIMIT','Ordena resultados y limita la cantidad de filas devueltas.','Actividad: muestra los cinco estudiantes con mayor promedio.']]],
        ['Manipulación de datos',[['INSERT','Aprende a insertar nuevos registros en una tabla.','Actividad: agrega tres cursos a una tabla cursos.'],['UPDATE','Modifica registros existentes de forma segura.','Actividad: actualiza la categoría de un curso específico.'],['DELETE','Elimina registros y comprende la importancia de usar WHERE.','Actividad: identifica qué registros eliminarías sin borrar toda la tabla.']]],
        ['Consultas útiles',[['COUNT y agregaciones','Calcula cantidades y métricas con COUNT, SUM y AVG.','Actividad: calcula el promedio de notas de una clase.'],['JOIN','Relaciona información de dos o más tablas usando claves.','Actividad: relaciona estudiantes con sus cursos inscritos.'],['Proyecto final SQL','Construye consultas para un pequeño sistema académico.','Actividad: crea una consulta que muestre estudiante, curso y nota.']]]
      ],
      quiz:[['¿Qué instrucción consulta datos?',['SELECT','GET','READ','QUERY'],0],['¿Qué cláusula filtra registros?',['ORDER','WHERE','FILTER','HAVINGX'],1],['¿Qué comando agrega registros?',['INSERT','ADD','CREATE','PUSH'],0],['¿Qué comando modifica registros?',['CHANGE','UPDATE','ALTER','EDIT'],1],['¿Qué operación relaciona tablas?',['JOIN','LINK','MERGE','CONNECT'],0]]
    }
  ];

  const allCourses = load('cursos', []);
  const allModules = load('modulos', []);
  const allLessons = load('lecciones', []);
  const allEvals = load('evaluaciones', []);
  const allContents = load('contenidos', []);

  defs.forEach(def => {
    if (!allCourses.some(c => c.codigo === def.codigo)) {
      allCourses.push({codigo:def.codigo,nombre:def.nombre,descripcion:def.descripcion,docenteCodigo:'DOC-DEMO-001',docenteNombre:'Laura Martínez',duracion:def.duracion,etiquetas:def.etiquetas,estado:'Activo',categoria:def.categoria,estudianteCodigo:'',estudianteNombre:''});
    }
    def.modules.forEach(([moduleName, lessons]) => {
      if (!allModules.some(m => m.cursoCodigo===def.codigo && m.nombre===moduleName)) allModules.push({cursoCodigo:def.codigo,nombre:moduleName});
      lessons.forEach(([title, content, activity], idx) => {
        const exists=allLessons.some(l=>l.cursoCodigo===def.codigo && l.moduloNombre===moduleName && l.titulo===title);
        if(!exists) allLessons.push({id:`${def.codigo}-LEC-${idx+1}-${Math.random().toString(36).slice(2,6)}`,cursoCodigo:def.codigo,moduloNombre:moduleName,titulo:title,contenido:content,actividad:activity});
      });
    });
    if(!allEvals.some(e=>e.id===`EV-${def.codigo}`)) allEvals.push({id:`EV-${def.codigo}`,cursoCodigo:def.codigo,titulo:`Evaluación final — ${def.nombre}`,preguntas:def.quiz.map(([texto,opciones,correcta])=>({texto,opciones,correcta})),creadoEn:new Date().toISOString()});
    if(!allContents.some(r=>r.curso===def.codigo)) { const link=def.codigo==='WEB-001'?'https://developer.mozilla.org/es/docs/Learn':def.codigo==='PY-001'?'https://docs.python.org/es/3/tutorial/':'https://dev.mysql.com/doc/'; allContents.push({curso:def.codigo,titulo:`Material complementario — ${def.nombre}`,video:'',enlace:link,documento:'',imagen:''}); }
  });
  save('cursos',allCourses); save('modulos',allModules); save('lecciones',allLessons); save('evaluaciones',allEvals); save('contenidos',allContents);
})();
