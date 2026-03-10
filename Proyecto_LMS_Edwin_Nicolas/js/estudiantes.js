let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || []

const tabla = document.getElementById("tablaestudiantes")
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
// CREAR / EDITAR ESTUDIANTE
// =========================

destudianteForm.addEventListener("submit", e => {

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
    const codigoExiste = estudiantes.some((d, index) => 
        d.codigo === codigo.value && index !== editandoIndex
    )

    if(codigoExiste){
        alert("Ya existe un estudiante con ese código.")
        return
    }

    const nuevoDestudiante = {

        codigo: codigo.value,

        nombre: nombres.value + " " + apellidos.value,

        email: email.value,

        area: area.value
    }

    if(editandoIndex !== null){

        estudiantes[editandoIndex] = nuevoestudiante
        editandoIndex = null

    } else {

        estudiantes.push(nuevoestudiante)

    }

    guardar()

    estudianteForm.reset()

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

    localStorage.setItem("estudiantes", JSON.stringify(estudiantes))

    render()

}


// =========================
// ELIMINAR ESTUDIANTE
// =========================

function eliminar(i){

    const cursos = JSON.parse(localStorage.getItem("cursos")) || []

    const estudianteCodigo = estudiantes[i].codigo

    const estaAsignado = cursos.some(c => c.estudianteCodigo === estudianteCodigo)

    if(estaAsignado){

        alert("No se puede eliminar este estudiantes porque está asignado a un curso.")

        return

    }

    if(confirm("¿Seguro que deseas eliminar este estudiante?")){

        estudiantes.splice(i,1)

        guardar()

    }

}


// =========================
// EDITAR ESTUDIANTE
// =========================

function editar(i){

    const d = estudiantes[i]

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