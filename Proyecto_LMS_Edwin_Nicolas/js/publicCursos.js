
let cursos=JSON.parse(localStorage.getItem("cursos"))||[]

const cont=document.getElementById("listaCursos")

cursos.forEach(c=>{

cont.innerHTML+=`

<div class="card">

<h3>${c.nombre}</h3>

<p>${c.descripcion}</p>

<p><b>Docente:</b> ${c.docente}</p>

<p>Módulos: ${c.modulos.length}</p>

</div>

`

})
