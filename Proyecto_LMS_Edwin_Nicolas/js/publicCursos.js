let lista = document.getElementById("listaCursos")

let cursos = JSON.parse(localStorage.getItem("cursos")) || []

if(cursos.length === 0){
lista.innerHTML = "<p>No hay cursos disponibles</p>"
}

cursos.forEach((curso,i)=>{

let progreso = Math.floor(Math.random()*80)+10

lista.innerHTML += `
<div class="courseCard">

<img src="https://picsum.photos/400/200?random=${i}" class="courseImage">

<div class="courseBody">

<div class="courseTitle">${curso.nombre}</div>

<div class="courseTeacher">Docente: ${curso.docente}</div>

<div class="progressBar">
<div class="progressFill" style="width:${progreso}%"></div>
</div>

<div class="progressText">
<span>${progreso}% completado</span>
</div>

<br>

<button onclick="verCurso(${i})">Ver Curso</button>

</div>
</div>
`

})

function verCurso(index){

localStorage.setItem("cursoSeleccionado", index)

window.location.href = "../cursopublico.html"

}