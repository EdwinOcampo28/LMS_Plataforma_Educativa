let cursos = JSON.parse(localStorage.getItem("cursos")) || []
let docentes = JSON.parse(localStorage.getItem("docentes")) || []
let admins = JSON.parse(localStorage.getItem("administrativos")) || []

document.getElementById("totalCursos").textContent = cursos.length + 3
document.getElementById("totalDocentes").textContent = docentes.length
document.getElementById("totalAdmins").textContent = admins.length

const usuario = sessionStorage.getItem("usuarioActivo")

if (!usuario) {
window.location = "index.html"
}