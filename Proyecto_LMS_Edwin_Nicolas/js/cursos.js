// ================= UTILIDADES =================

function guardar(key,data){
localStorage.setItem(key,JSON.stringify(data))
}

function cargar(key){
return JSON.parse(localStorage.getItem(key)) || []
}

// ================= DATOS =================

let cursos = cargar("cursos")
let modulos = cargar("modulos")
let lecciones = cargar("lecciones")

// ================= ELEMENTOS =================

const tablaCursos = document.getElementById("tablaCursos")
const cursoForm = document.getElementById("cursoForm")

const codigo = document.getElementById("codigo")
const nombre = document.getElementById("nombre")
const descripcion = document.getElementById("descripcion")
const docente = document.getElementById("docente")
const estudiante = document.getElementById("estudiante")
const duracion = document.getElementById("duracion")
const etiquetas = document.getElementById("etiquetas")
const estado = document.getElementById("estado")

// MODULOS

const moduloForm = document.getElementById("moduloForm")
const cursoModulo = document.getElementById("cursoModulo")
const moduloNombre = document.getElementById("moduloNombre")
const tablaModulos = document.getElementById("tablaModulos")

// LECCIONES

const leccionForm = document.getElementById("leccionForm")
const cursoLeccion = document.getElementById("cursoLeccion")
const moduloLeccion = document.getElementById("moduloLeccion")
const titulo = document.getElementById("titulo")
const contenido = document.getElementById("contenido")
const tablaLecciones = document.getElementById("tablaLecciones")

let editandoCurso = null
let editandoModulo = null
let editandoLeccion = null

// ================= SELECTORES =================

function cargarSelectores(){

const docentes = cargar("docentes")
const estudiantes = cargar("estudiantes")

if(docente){

docente.innerHTML=`<option value="">Seleccionar docente</option>`

docentes.forEach(d=>{
docente.innerHTML+=`
<option value="${d.codigo}">
${d.codigo} - ${d.nombre}
</option>
`
})

}

if(estudiante){

estudiante.innerHTML=`<option value="">Seleccionar estudiante</option>`

estudiantes.forEach(e=>{
estudiante.innerHTML+=`
<option value="${e.codigo}">
${e.codigo} - ${e.nombre}
</option>
`
})

}

}

// ================= CURSOS EN SELECT =================

function cargarCursosEnSelect(){

if(cursoModulo){

cursoModulo.innerHTML=`<option value="">Seleccionar curso</option>`

cursos.forEach(c=>{
cursoModulo.innerHTML+=`
<option value="${c.codigo}">
${c.codigo} - ${c.nombre}
</option>
`
})

}

if(cursoLeccion){

cursoLeccion.innerHTML=`<option value="">Seleccionar curso</option>`

cursos.forEach(c=>{
cursoLeccion.innerHTML+=`
<option value="${c.codigo}">
${c.codigo} - ${c.nombre}
</option>
`
})

}

}

// ================= CURSOS =================

if(cursoForm){

cursoForm.addEventListener("submit",e=>{

e.preventDefault()

const docentes = cargar("docentes")
const estudiantes = cargar("estudiantes")

const docenteExiste = docentes.find(d=>d.codigo==docente.value)
const estudianteExiste = estudiantes.find(e=>e.codigo==estudiante.value)

if(!docenteExiste){
alert("Seleccione un docente válido")
return
}

if(!estudianteExiste){
alert("Seleccione un estudiante válido")
return
}

const nuevoCurso={

codigo:codigo.value,
nombre:nombre.value,
descripcion:descripcion.value,

docenteCodigo:docente.value,
docenteNombre:docenteExiste.nombre,

estudianteCodigo:estudiante.value,
estudianteNombre:estudianteExiste.nombre,

duracion:duracion.value,
etiquetas:etiquetas.value,
estado:estado.value

}

if(editandoCurso!==null){

cursos[editandoCurso]=nuevoCurso
editandoCurso=null

}else{

cursos.push(nuevoCurso)

}

guardar("cursos",cursos)

cursoForm.reset()

cargarCursosEnSelect()
renderCursos()

})

}

// ================= TABLA CURSOS =================

function renderCursos(){

if(!tablaCursos) return

tablaCursos.innerHTML=""

cursos.forEach((c,i)=>{

const totalModulos = modulos.filter(m=>m.cursoCodigo===c.codigo).length

tablaCursos.innerHTML+=`

<tr>

<td>${c.codigo}</td>
<td>${c.nombre}</td>
<td>${c.docenteNombre}</td>
<td>${c.estudianteNombre}</td>
<td>${c.duracion}</td>
<td>${c.etiquetas}</td>
<td>${c.estado}</td>
<td>${totalModulos}</td>

<td>

<button onclick="editarCurso(${i})">Editar</button>

<button onclick="eliminarCurso(${i})">Eliminar</button>

</td>

</tr>

`

})

}

function editarCurso(i){

const c=cursos[i]

codigo.value=c.codigo
nombre.value=c.nombre
descripcion.value=c.descripcion
docente.value=c.docenteCodigo
estudiante.value=c.estudianteCodigo
duracion.value=c.duracion
etiquetas.value=c.etiquetas
estado.value=c.estado

editandoCurso=i

window.scrollTo({top:0,behavior:"smooth"})

}

function eliminarCurso(i){

const cursoCodigo=cursos[i].codigo

const tieneModulos=modulos.some(m=>m.cursoCodigo===cursoCodigo)

if(tieneModulos){

alert("No se puede eliminar porque tiene módulos")
return

}

if(confirm("¿Eliminar curso?")){

cursos.splice(i,1)

guardar("cursos",cursos)

renderCursos()

}

}

// ================= MODULOS =================

if(moduloForm){

moduloForm.addEventListener("submit",e=>{

e.preventDefault()

const nuevoModulo={

cursoCodigo:cursoModulo.value,
nombre:moduloNombre.value

}

if(editandoModulo!==null){

modulos[editandoModulo]=nuevoModulo
editandoModulo=null

}else{

modulos.push(nuevoModulo)

}

guardar("modulos",modulos)

moduloForm.reset()

renderModulos()

})

}

function renderModulos(){

if(!tablaModulos) return

tablaModulos.innerHTML=""

modulos.forEach((m,i)=>{

const curso=cursos.find(c=>c.codigo===m.cursoCodigo)

tablaModulos.innerHTML+=`

<tr>

<td>${curso?curso.nombre:"Curso eliminado"}</td>

<td>${m.nombre}</td>

<td>

<button onclick="editarModulo(${i})">Editar</button>

<button onclick="eliminarModulo(${i})">Eliminar</button>

</td>

</tr>

`

})

}

function editarModulo(i){

const m=modulos[i]

cursoModulo.value=m.cursoCodigo
moduloNombre.value=m.nombre

editandoModulo=i

window.scrollTo({top:0,behavior:"smooth"})

}

function eliminarModulo(i){

const modulo = modulos[i]

// verificar si el módulo tiene lecciones
const tieneLecciones = lecciones.some(
l => l.cursoCodigo === modulo.cursoCodigo && l.moduloNombre === modulo.nombre
)

if(tieneLecciones){

alert("No se puede eliminar el módulo porque tiene lecciones registradas")

return

}

if(confirm("¿Eliminar módulo?")){

modulos.splice(i,1)

guardar("modulos",modulos)

renderModulos()

}

}

// ================= LECCIONES =================

// cargar módulos cuando cambia curso

if(cursoLeccion){

cursoLeccion.addEventListener("change",()=>{

const cursoCodigo=cursoLeccion.value

moduloLeccion.innerHTML=`<option value="">Seleccionar módulo</option>`

modulos
.filter(m=>m.cursoCodigo===cursoCodigo)
.forEach(m=>{

moduloLeccion.innerHTML+=`
<option value="${m.nombre}">
${m.nombre}
</option>
`

})

})

}

if(leccionForm){

leccionForm.addEventListener("submit",e=>{

e.preventDefault()

const nuevaLeccion={

cursoCodigo:cursoLeccion.value,
moduloNombre:moduloLeccion.value,
titulo:titulo.value,
contenido:contenido.value

}

if(editandoLeccion!==null){

lecciones[editandoLeccion]=nuevaLeccion
editandoLeccion=null

}else{

lecciones.push(nuevaLeccion)

}

guardar("lecciones",lecciones)

leccionForm.reset()

renderLecciones()

})

}

function renderLecciones(){

if(!tablaLecciones) return

tablaLecciones.innerHTML=""

lecciones.forEach((l,i)=>{

const curso=cursos.find(c=>c.codigo===l.cursoCodigo)

tablaLecciones.innerHTML+=`

<tr>

<td>${curso?curso.nombre:"Curso eliminado"}</td>
<td>${l.moduloNombre}</td>
<td>${l.titulo}</td>

<td>

<button onclick="editarLeccion(${i})">Editar</button>

<button onclick="eliminarLeccion(${i})">Eliminar</button>

</td>

</tr>

`

})

}

function editarLeccion(i){

const l=lecciones[i]

cursoLeccion.value=l.cursoCodigo

cursoLeccion.dispatchEvent(new Event("change"))

setTimeout(()=>{
moduloLeccion.value=l.moduloNombre
},100)

titulo.value=l.titulo
contenido.value=l.contenido

editandoLeccion=i

window.scrollTo({top:0,behavior:"smooth"})

}

function eliminarLeccion(i){

if(confirm("¿Eliminar lección?")){

lecciones.splice(i,1)

guardar("lecciones",lecciones)

renderLecciones()

}

}

// ================= INICIO =================

cargarSelectores()
cargarCursosEnSelect()
renderCursos()
renderModulos()
renderLecciones()