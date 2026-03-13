// ======================
// DATOS
// ======================

let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || []

const form = document.getElementById("estudiantesForm")
const tabla = document.getElementById("tablaestudiantes")
const buscar = document.getElementById("buscar")

const identificacion = document.getElementById("identificacion")
const nombres = document.getElementById("nombres")
const apellidos = document.getElementById("apellidos")
const genero = document.getElementById("genero")
const fechaNacimiento = document.getElementById("fechaNacimiento")
const direccion = document.getElementById("direccion")
const telefono = document.getElementById("telefono")

let editando = null

render()

// ======================
// CREAR / ACTUALIZAR
// ======================

form.addEventListener("submit", e => {

e.preventDefault()

if(
!identificacion.value ||
!nombres.value ||
!apellidos.value ||
!genero.value ||
!fechaNacimiento.value ||
!direccion.value ||
!telefono.value
){
alert("Todos los campos son obligatorios")
return
}

const existe = estudiantes.some((e,i)=>
e.identificacion === identificacion.value && i !== editando
)

if(existe){
alert("Ya existe un estudiante con esa identificación")
return
}

const estudiante = {

codigo: identificacion.value,
nombre: nombres.value + " " + apellidos.value,

identificacion: identificacion.value,
nombres: nombres.value,
apellidos: apellidos.value,
genero: genero.value,
fechaNacimiento: fechaNacimiento.value,
direccion: direccion.value,
telefono: telefono.value

}

if(editando !== null){

estudiantes[editando] = estudiante
editando = null

}else{

estudiantes.push(estudiante)

}

guardar()

form.reset()

})

// ======================
// GUARDAR
// ======================

function guardar(){

localStorage.setItem("estudiantes", JSON.stringify(estudiantes))

render()

}

// ======================
// ELIMINAR
// ======================

function eliminar(i){
    const estudiante = estudiantes[i];
    
    // Cargar cursos
    const cursos = JSON.parse(localStorage.getItem("cursos")) || [];

    // Revisar si el estudiante está inscrito en algún curso
    const inscrito = cursos.some(c => c.estudianteCodigo === estudiante.codigo);

    if(inscrito){
        alert("No se puede eliminar el estudiante porque está inscrito en uno o más cursos.");
        return;
    }

    if(confirm("¿Eliminar estudiante?")){
        estudiantes.splice(i,1);
        guardar();
    }
}

// ======================
// EDITAR
// ======================

function editar(i){

const e = estudiantes[i]

identificacion.value = e.identificacion
nombres.value = e.nombres
apellidos.value = e.apellidos
genero.value = e.genero
fechaNacimiento.value = e.fechaNacimiento
direccion.value = e.direccion
telefono.value = e.telefono

editando = i

window.scrollTo({top:0,behavior:"smooth"})

}

// ======================
// BUSCAR
// ======================

buscar.addEventListener("input",()=>{

render(buscar.value)

})

// ======================
// MOSTRAR TABLA
// ======================

function render(filtro=""){

tabla.innerHTML=""

estudiantes

.filter(e =>

e.nombres.toLowerCase().includes(filtro.toLowerCase()) ||
e.apellidos.toLowerCase().includes(filtro.toLowerCase()) ||
e.identificacion.includes(filtro)

)

.forEach((e,i)=>{

tabla.innerHTML+=`

<tr>

<td>${e.identificacion}</td>
<td>${e.nombres}</td>
<td>${e.apellidos}</td>
<td>${e.genero}</td>
<td>${e.fechaNacimiento}</td>
<td>${e.direccion}</td>
<td>${e.telefono}</td>

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