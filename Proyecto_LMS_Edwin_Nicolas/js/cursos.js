// ================= UTILIDADES =================

function guardar(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function cargar(key) {
    return JSON.parse(localStorage.getItem(key)) || []
}

let cursos = cargar("cursos")
let modulos = cargar("modulos")
let lecciones = cargar("lecciones")

// ================= CURSOS =================

const tabla = document.getElementById("tablaCursos")
const cursoForm = document.getElementById("cursoForm")
const buscador = document.getElementById("buscarCurso")

const codigo = document.getElementById("codigo")
const nombre = document.getElementById("nombre")
const descripcion = document.getElementById("descripcion")
const docente = document.getElementById("docente")
const duracion = document.getElementById("duracion")
const etiquetas = document.getElementById("etiquetas")
const estado = document.getElementById("estado")
const categoria = document.getElementById("categoria")

let editandoIndex = null

render()

if (cursoForm) {
    cursoForm.addEventListener("submit", e => {

        e.preventDefault()

        const docentes = cargar("docentes")
        const docenteExiste = docentes.find(d => d.codigo === docente.value)

        if (!docenteExiste) {
            alert("El código del docente no existe.")
            return
        }

        const existe = cursos.some(c => c.codigo === codigo.value)

        if (existe && editandoIndex === null) {
            alert("Ya existe un curso con ese código")
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
}

function guardarCursos() {
    guardar("cursos", cursos)
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

    if (!tabla) return

    const filtro = buscador ? buscador.value.toLowerCase() : ""

    const html = cursos
        .filter(c =>
            c.nombre.toLowerCase().includes(filtro) ||
            c.codigo.toLowerCase().includes(filtro)
        )
        .map((c, i) => {

            const totalModulos = modulos.filter(m => m.cursoCodigo === c.codigo).length

            return `
        <tr>
            <td>${c.codigo}</td>
            <td>${c.nombre}</td>
            <td>${c.docenteNombre}</td>
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
        .join("")

    tabla.innerHTML = html
}

if (buscador) {
    buscador.addEventListener("keyup", render)
}

// ================= MÓDULOS =================

const moduloForm = document.getElementById("moduloForm")
const cursoModulo = document.getElementById("cursoModulo")
const moduloNombre = document.getElementById("moduloNombre")
const tablaModulos = document.getElementById("tablaModulos")

let editandoModuloIndex = null

if (moduloForm) {
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

        if (editandoModuloIndex !== null) {
            modulos[editandoModuloIndex] = nuevoModulo
            editandoModuloIndex = null
        } else {
            modulos.push(nuevoModulo)
        }

        guardar("modulos", modulos)

        moduloForm.reset()

        renderModulos()

    })
}

function renderModulos() {

    if (!tablaModulos) return

    tablaModulos.innerHTML = ""

    modulos.forEach((m, i) => {

        const totalLecciones = lecciones.filter(l =>
            l.cursoCodigo === m.cursoCodigo &&
            l.moduloNombre === m.nombre
        ).length

        tablaModulos.innerHTML += `
        <tr>
            <td>${m.cursoNombre}</td>
            <td>${m.nombre}</td>
            <td>${totalLecciones}</td>
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

    guardar("modulos", modulos)

    renderModulos()
}

function editarModulo(i) {

    const modulo = modulos[i]

    cursoModulo.value = modulo.cursoCodigo
    moduloNombre.value = modulo.nombre

    editandoModuloIndex = i
}

// ================= LECCIONES =================

const leccionForm = document.getElementById("leccionForm")
const cursoLeccion = document.getElementById("cursoLeccion")
const moduloLeccion = document.getElementById("moduloLeccion")
const titulo = document.getElementById("titulo")
const contenido = document.getElementById("contenido")
const tablaLecciones = document.getElementById("tablaLecciones")

let editandoLeccionIndex = null

if (leccionForm) {
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

        if (editandoLeccionIndex !== null) {
            lecciones[editandoLeccionIndex] = nuevaLeccion
            editandoLeccionIndex = null
        } else {
            lecciones.push(nuevaLeccion)
        }

        guardar("lecciones", lecciones)

        leccionForm.reset()

        renderLecciones()

    })
}

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
                <button onclick="editarLeccion(${i})">Editar</button>
                <button onclick="eliminarLeccion(${i})">Eliminar</button>
            </td>
        </tr>
        `
    })
}

function eliminarLeccion(i) {

    lecciones.splice(i, 1)

    guardar("lecciones", lecciones)

    renderLecciones()
}

function editarLeccion(i) {

    const leccion = lecciones[i]

    cursoLeccion.value = leccion.cursoCodigo
    moduloLeccion.value = leccion.moduloNombre
    titulo.value = leccion.titulo
    contenido.value = leccion.contenido

    editandoLeccionIndex = i
}

// ================= INICIALIZAR =================

renderModulos()
renderLecciones()