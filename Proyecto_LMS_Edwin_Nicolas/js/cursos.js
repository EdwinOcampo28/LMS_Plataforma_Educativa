let cursos = JSON.parse(localStorage.getItem("cursos")) || []
let modulos = JSON.parse(localStorage.getItem("modulos")) || []
let lecciones = JSON.parse(localStorage.getItem("lecciones")) || []

// ================= CURSOS =================

const tabla = document.getElementById("tablaCursos")
const cursoForm = document.getElementById("cursoForm")

const codigo = document.getElementById("codigo")
const nombre = document.getElementById("nombre")
const descripcion = document.getElementById("descripcion")
const docente = document.getElementById("docente")
const duracion = document.getElementById("duracion")
const etiquetas = document.getElementById("etiquetas")
const estado = document.getElementById("estado")

let editandoIndex = null

render()

cursoForm.addEventListener("submit", e => {

    e.preventDefault()

    const docentes = JSON.parse(localStorage.getItem("docentes")) || []
    const docenteExiste = docentes.find(d => d.codigo === docente.value)

    if (!docenteExiste) {
        alert("El código del docente no existe.")
        return
    }

    const nuevoCurso = {
        codigo: codigo.value,
        nombre: nombre.value,
        descripcion: descripcion.value,
        docenteCodigo: docente.value,
        docenteNombre: docenteExiste.nombre,
        duracion: duracion.value,
        etiquetas: etiquetas.value,
        estado: estado.value
    }

    if (editandoIndex !== null) {
        cursos[editandoIndex] = nuevoCurso
        editandoIndex = null
    } else {
        cursos.push(nuevoCurso)
    }

    guardarCursos()
    cursoForm.reset()
})

function guardarCursos() {
    localStorage.setItem("cursos", JSON.stringify(cursos))
    render()
}

function eliminarCurso(i) {

    const cursoCodigo = cursos[i].codigo

    const tieneModulos = modulos.some(m => m.cursoCodigo === cursoCodigo)
    const tieneLecciones = lecciones.some(l => l.cursoCodigo === cursoCodigo)

    if (tieneModulos || tieneLecciones) {
        alert("No se puede eliminar el curso porque tiene módulos o lecciones.")
        return
    }

    cursos.splice(i, 1)
    guardarCursos()
}

function editarCurso(i) {

    const curso = cursos[i]

    codigo.value = curso.codigo
    nombre.value = curso.nombre
    descripcion.value = curso.descripcion
    docente.value = curso.docenteCodigo
    duracion.value = curso.duracion
    etiquetas.value = curso.etiquetas
    estado.value = curso.estado

    editandoIndex = i
}

function render() {

    tabla.innerHTML = ""

    cursos.forEach((c, i) => {

        tabla.innerHTML += `
        <tr>
            <td>${c.codigo}</td>
            <td>${c.nombre}</td>
            <td>${c.docenteNombre}</td>
            <td>${c.duracion}</td>
            <td>${c.etiquetas}</td>
            <td>${c.estado}</td>
            <td>
                <button onclick="editarCurso(${i})">Editar</button>
                <button onclick="eliminarCurso(${i})">Eliminar</button>
            </td>
        </tr>
        `
    })
}

// ================= MÓDULOS =================

const moduloForm = document.getElementById("moduloForm")
const cursoModulo = document.getElementById("cursoModulo")
const moduloNombre = document.getElementById("moduloNombre")
const tablaModulos = document.getElementById("tablaModulos")

moduloForm.addEventListener("submit", e => {

    e.preventDefault()

    const cursoExiste = cursos.find(c => c.codigo === cursoModulo.value)

    if (!cursoExiste) {
        alert("No existe un curso con ese código.")
        return
    }

    const nuevoModulo = {
        cursoCodigo: cursoModulo.value,
        cursoNombre: cursoExiste.nombre,
        nombre: moduloNombre.value
    }

    modulos.push(nuevoModulo)

    localStorage.setItem("modulos", JSON.stringify(modulos))
    moduloForm.reset()
    renderModulos()
})

function renderModulos() {

    if (!tablaModulos) return

    tablaModulos.innerHTML = ""

    modulos.forEach((m, i) => {
        tablaModulos.innerHTML += `
        <tr>
            <td>${m.cursoNombre}</td>
            <td>${m.nombre}</td>
            <td>
                <button onclick="editarModulo(${i})">Editar</button>
                <button onclick="eliminarModulo(${i})">Eliminar</button>
            </td>
        </tr>
        `
    })
}

function eliminarModulo(i) {

    const modulo = modulos[i]

    const tieneLecciones = lecciones.some(l =>
        l.cursoCodigo === modulo.cursoCodigo &&
        l.moduloNombre === modulo.nombre
    )

    if (tieneLecciones) {
        alert("No se puede eliminar el módulo porque tiene lecciones.")
        return
    }

    modulos.splice(i, 1)

    localStorage.setItem("modulos", JSON.stringify(modulos))

    renderModulos()
}

function editarModulo(i) {

    const nuevoNombre = prompt("Editar nombre del módulo:", modulos[i].nombre)

    if (!nuevoNombre) return

    modulos[i].nombre = nuevoNombre

    localStorage.setItem("modulos", JSON.stringify(modulos))

    renderModulos()
}

// ================= LECCIONES =================

const leccionForm = document.getElementById("leccionForm")
const cursoLeccion = document.getElementById("cursoLeccion")
const moduloLeccion = document.getElementById("moduloLeccion")
const titulo = document.getElementById("titulo")
const contenido = document.getElementById("contenido")
const tablaLecciones = document.getElementById("tablaLecciones")

leccionForm.addEventListener("submit", e => {

    e.preventDefault()

    const cursoExiste = cursos.find(c => c.codigo === cursoLeccion.value)

    if (!cursoExiste) {
        alert("El curso no existe.")
        return
    }

    const moduloExiste = modulos.find(m =>
        m.cursoCodigo === cursoLeccion.value &&
        m.nombre === moduloLeccion.value
    )

    if (!moduloExiste) {
        alert("El módulo no existe dentro de ese curso.")
        return
    }

    const nuevaLeccion = {
        cursoCodigo: cursoLeccion.value,
        cursoNombre: cursoExiste.nombre,
        moduloNombre: moduloLeccion.value,
        titulo: titulo.value,
        contenido: contenido.value
    }

    lecciones.push(nuevaLeccion)

    localStorage.setItem("lecciones", JSON.stringify(lecciones))

    leccionForm.reset()

    renderLecciones()
})

function renderLecciones() {

    if (!tablaLecciones) return

    tablaLecciones.innerHTML = ""

    lecciones.forEach((l, i) => {
        tablaLecciones.innerHTML += `
        <tr>
            <td>${l.cursoNombre}</td>
            <td>${l.moduloNombre}</td>
            <td>${l.titulo}</td>
            <td>
                <button onclick="eliminarLeccion(${i})">Eliminar</button>
            </td>
        </tr>
        `
    })
}

function eliminarLeccion(i) {

    lecciones.splice(i, 1)

    localStorage.setItem("lecciones", JSON.stringify(lecciones))

    renderLecciones()
}

renderModulos()
renderLecciones()