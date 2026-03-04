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

        duracion: duracion.value,
        etiquetas: etiquetas.value,
        estado: estado.value,

        modulos: []

    })

    guardar()

    cursoForm.reset()

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

    moduloForm.reset()

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

    leccionForm.reset()

})

function eliminar(i) {

    cursos.splice(i, 1)

    guardar()

}

function cambiarEstado(i) {

    if (cursos[i].estado === "Activo") {
        cursos[i].estado = "Inactivo"
    } else {
        cursos[i].estado = "Activo"
    }

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
<td>${c.duracion}</td>
<td>${c.etiquetas}</td>
<td>${c.estado}</td>
<td>
<button onclick="eliminar(${i})">Eliminar</button>
</td>
</tr>

`

    })

}