
let cursos = JSON.parse(localStorage.getItem("cursos")) || []

const tabla = document.getElementById("tablaCursos")

render()

cursoForm.addEventListener("submit", e => {

    e.preventDefault()

    cursos.push({

        codigo: codigo.value,
        nombre: nombre.value,
        descripcion: descripcion.value,
        docente: docente.value,
        modulos: []

    })

    guardar()

})

moduloForm.addEventListener("submit", e => {

    e.preventDefault()

    let curso = cursos.find(c => c.codigo === cursoModulo.value)

    if (!curso) return alert("Curso no encontrado")

    curso.modulos.push({

        nombre: moduloNombre.value,
        lecciones: []

    })

    guardar()

})

leccionForm.addEventListener("submit", e => {

    e.preventDefault()

    let curso = cursos.find(c => c.codigo === cursoLeccion.value)

    if (!curso) return

    let modulo = curso.modulos.find(m => m.nombre === moduloLeccion.value)

    if (!modulo) return

    modulo.lecciones.push({

        titulo: titulo.value,
        contenido: contenido.value

    })

    guardar()

})

function eliminar(i) {

    cursos.splice(i, 1)

    guardar()

}

function guardar() {

    localStorage.setItem("cursos", JSON.stringify(cursos))

    render()

}

function render() {

    tabla.innerHTML = ""

    cursos.forEach((c, i) => {

        tabla.innerHTML += `

<tr>
<td>${c.codigo}</td>
<td>${c.nombre}</td>
<td>${c.docente}</td>
<td>
<button onclick="eliminar(${i})">Eliminar</button>
</td>
</tr>

`

    })

}
