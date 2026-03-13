function cargar(key){
return JSON.parse(localStorage.getItem(key)) || []
}

// ================= CONTADOR ANIMADO =================

function animarContador(elemento, valorFinal){

let inicio = 0
let duracion = 800
let pasos = 30
let incremento = valorFinal / pasos
let intervalo = duracion / pasos

let contador = setInterval(()=>{

inicio += incremento

if(inicio >= valorFinal){
elemento.textContent = valorFinal
clearInterval(contador)
}else{
elemento.textContent = Math.floor(inicio)
}

}, intervalo)

}

// ================= DASHBOARD =================

function actualizarDashboard(){

const cursos = cargar("cursos")
const estudiantes = cargar("estudiantes")
const docentes = cargar("docentes")
const administrativos = cargar("administrativos")
const modulos = cargar("modulos")

const totalCursos = document.getElementById("totalCursos")
const totalEstudiantes = document.getElementById("totalEstudiantes")
const totalDocentes = document.getElementById("totalDocentes")
const totalAdmins = document.getElementById("totalAdmins")
const totalModulos = document.getElementById("totalModulos")

if(totalCursos){
animarContador(totalCursos, cursos.length)
}

if(totalEstudiantes){
animarContador(totalEstudiantes, estudiantes.length)
}

if(totalDocentes){
animarContador(totalDocentes, docentes.length)
}

if(totalAdmins){
animarContador(totalAdmins, administrativos.length)
}

if(totalModulos){
animarContador(totalModulos, modulos.length)
}

}

actualizarDashboard()

function crearGrafica(){

const cursos = cargar("cursos")
const estudiantes = cargar("estudiantes")
const docentes = cargar("docentes")
const administrativos = cargar("administrativos")

const ctx = document.getElementById("graficaDashboard")

if(!ctx) return

new Chart(ctx,{

type:"bar",

data:{

labels:["Cursos","Estudiantes","Docentes","Administrativos"],

datasets:[{

label:"Cantidad",

data:[
cursos.length,
estudiantes.length,
docentes.length,
administrativos.length
],

borderWidth:1

}]

},

options:{
responsive:true,
plugins:{
legend:{
display:false
}
}
}

})

}

crearGrafica()

// ================= CURSOS DINAMICOS =================

function cargarCursos(){

const cursos = cargar("cursos")
const contenedor = document.getElementById("listaCursos")

if(!contenedor) return

contenedor.innerHTML=""

cursos.forEach(c=>{

contenedor.innerHTML += `

<div class="courseCard">

<div class="courseBody">

<div class="courseTitle">${c.nombre}</div>

<div class="courseTeacher">${c.docenteNombre}</div>

<p>${c.descripcion}</p>

</div>

</div>

`

})

}

cargarCursos()



// ================= CURSO MAS POPULAR =================

function cursoPopular(){

const cursos = cargar("cursos")
const popular = document.getElementById("cursoPopular")

if(!popular) return

if(cursos.length===0){

popular.innerHTML="No hay cursos registrados"
return

}

let curso = cursos[0]

popular.innerHTML = `
<h3>${curso.nombre}</h3>
<p>Docente: ${curso.docenteNombre}</p>
`

}

cursoPopular()



// ================= ULTIMOS ESTUDIANTES =================

function ultimosEstudiantes(){

const estudiantes = cargar("estudiantes")
const tabla = document.getElementById("ultimosEstudiantes")

if(!tabla) return

tabla.innerHTML=""

estudiantes
.slice(-5)
.reverse()
.forEach(e=>{

tabla.innerHTML+=`

<tr>

<td>${e.identificacion}</td>
<td>${e.nombres} ${e.apellidos}</td>
<td>${e.telefono}</td>

</tr>

`

})

}

ultimosEstudiantes()