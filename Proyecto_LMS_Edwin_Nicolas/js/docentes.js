let docentes = JSON.parse(localStorage.getItem("docentes")) || []

const tabla = document.getElementById("tablaDocentes")
const buscar = document.getElementById("buscar")
const docenteForm = document.getElementById("docenteForm")

const codigo = document.getElementById("codigo")
const nombres = document.getElementById("nombres")
const apellidos = document.getElementById("apellidos")
const email = document.getElementById("email")
const area = document.getElementById("area")

render()

docenteForm.addEventListener("submit", e => {

    e.preventDefault()

    docentes.push({
        codigo: codigo.value,
        nombre: nombres.value + " " + apellidos.value,
        email: email.value,
        area: area.value
    })

    guardar()
    docenteForm.reset()
})

buscar.addEventListener("input", () => {
    render(buscar.value)
})

function guardar() {
    localStorage.setItem("docentes", JSON.stringify(docentes))
    render()
}

function eliminar(i) {
    docentes.splice(i, 1)
    guardar()
}

function render(filtro = "") {

    tabla.innerHTML = ""

    docentes
        .filter(d => d.nombre.toLowerCase().includes(filtro.toLowerCase()))
        .forEach((d, i) => {

            tabla.innerHTML += `
            <tr>
                <td>${d.codigo}</td>
                <td>${d.nombre}</td>
                <td>${d.email}</td>
                <td>${d.area}</td>
                <td>
                    <button onclick="eliminar(${i})">Eliminar</button>
                </td>
            </tr>
            `
        })
}