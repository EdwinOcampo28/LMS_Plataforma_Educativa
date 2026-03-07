let admins = JSON.parse(localStorage.getItem("administrativos")) || [];

const form = document.getElementById("adminForm");
const lista = document.getElementById("listaAdmins");

let editIndex = -1;

render();


// ==========================
// CREAR / EDITAR ADMIN
// ==========================
form.addEventListener("submit", function(e){

    e.preventDefault();

    let identificacion = document.getElementById("identificacion").value.trim();
    let nombres = document.getElementById("nombres").value.trim();
    let apellidos = document.getElementById("apellidos").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // VALIDAR CAMPOS VACIOS
    if(!identificacion || !nombres || !apellidos || !email || !password){

        alert("Todos los campos son obligatorios");

        return;

    }

    let admin = {
        identificacion,
        nombres,
        apellidos,
        email,
        password
    };

    // SI ESTA EDITANDO
    if(editIndex >= 0){

        admins[editIndex] = admin;
        editIndex = -1;

    }else{

        admins.push(admin);

    }

    localStorage.setItem("administrativos", JSON.stringify(admins));

    form.reset();

    render();

});


// ==========================
// ELIMINAR ADMIN
// ==========================
function eliminar(index){

    if(confirm("¿Seguro que deseas eliminar este administrativo?")){

        admins.splice(index,1);

        localStorage.setItem("administrativos", JSON.stringify(admins));

        render();

    }

}


// ==========================
// EDITAR ADMIN
// ==========================
function editar(index){

    let admin = admins[index];

    document.getElementById("identificacion").value = admin.identificacion;
    document.getElementById("nombres").value = admin.nombres;
    document.getElementById("apellidos").value = admin.apellidos;
    document.getElementById("email").value = admin.email;
    document.getElementById("password").value = admin.password;

    editIndex = index;

}


// ==========================
// MOSTRAR ADMINISTRATIVOS
// ==========================
function render(){

    lista.innerHTML = "";

    admins.forEach((admin, index) => {

        lista.innerHTML += `

        <li class="card" style="margin-bottom:10px">

            <strong>${admin.nombres} ${admin.apellidos}</strong><br>
            ${admin.email}

            <div style="margin-top:10px">

                <button onclick="editar(${index})">
                    Editar
                </button>

                <button onclick="eliminar(${index})">
                    Eliminar
                </button>

            </div>

        </li>

        `;

    });

}