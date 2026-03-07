let docentes = JSON.parse(localStorage.getItem("docentes")) || []

const tabla = document.getElementById("tablaDocentes")
const buscar = document.getElementById("buscar")
const docenteForm = document.getElementById("docenteForm")

const codigo = document.getElementById("codigo")
const nombres = document.getElementById("nombres")
const apellidos = document.getElementById("apellidos")
const email = document.getElementById("email")
const area = document.getElementById("area")

let editandoIndex = null

render()

// =========================
// CREAR / EDITAR DOCENTE
// =========================

docenteForm.addEventListener("submit", e => {

    e.preventDefault()

    // VALIDAR CAMPOS VACÍOS
    if(
        codigo.value.trim() === "" ||
        nombres.value.trim() === "" ||
        apellidos.value.trim() === "" ||
        email.value.trim() === "" ||
        area.value.trim() === ""
    ){
        alert("Todos los campos son obligatorios.")
        return
    }

    // VALIDAR CÓDIGO DUPLICADO
    const codigoExiste = docentes.some((d, index) => 
        d.codigo === codigo.value && index !== editandoIndex
    )

    if(codigoExiste){
        alert("Ya existe un docente con ese código.")
        return
    }

    const nuevoDocente = {

        codigo: codigo.value,

        nombre: nombres.value + " " + apellidos.value,

        email: email.value,

        area: area.value
    }

    if(editandoIndex !== null){

        docentes[editandoIndex] = nuevoDocente
        editandoIndex = null

    } else {

        docentes.push(nuevoDocente)

    }

    guardar()

    docenteForm.reset()

})


// =========================
// BUSCADOR
// =========================

buscar.addEventListener("input", () => {

    render(buscar.value)

})


// =========================
// GUARDAR
// =========================

function guardar(){

    localStorage.setItem("docentes", JSON.stringify(docentes))

    render()

}


// =========================
// ELIMINAR DOCENTE
// =========================

function eliminar(i){

    const cursos = JSON.parse(localStorage.getItem("cursos")) || []

    const docenteCodigo = docentes[i].codigo

    const estaAsignado = cursos.some(c => c.docenteCodigo === docenteCodigo)

    if(estaAsignado){

        alert("No se puede eliminar este docente porque está asignado a un curso.")

        return

    }

    if(confirm("¿Seguro que deseas eliminar este docente?")){

        docentes.splice(i,1)

        guardar()

    }

}


// =========================
// EDITAR DOCENTE
// =========================

function editar(i){

    const d = docentes[i]

    codigo.value = d.codigo

    const partes = d.nombre.split(" ")

    nombres.value = partes[0] || ""

    apellidos.value = partes.slice(1).join(" ") || ""

    email.value = d.email

    area.value = d.area

    editandoIndex = i

}


// =========================
// RENDER TABLA
// =========================

function render(filtro=""){

    if(!tabla) return

    tabla.innerHTML=""

    docentes

    .filter(d => d.nombre.toLowerCase().includes(filtro.toLowerCase()))

    .forEach((d,i)=>{

        tabla.innerHTML+=`

        <tr>

            <td>${d.codigo}</td>

            <td>${d.nombre}</td>

            <td>${d.email}</td>

            <td>${d.area}</td>

            <td>

                <button onclick="editar(${i})">
                Editar
                </button>

                <button onclick="eliminar(${i})">
                Eliminar
                </button>

            </td>

        </tr>

        `
    })

}