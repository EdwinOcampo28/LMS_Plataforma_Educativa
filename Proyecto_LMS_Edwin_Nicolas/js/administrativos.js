let admins = JSON.parse(localStorage.getItem("administrativos")) || [];

const form = document.getElementById("adminForm");
const lista = document.getElementById("listaAdmins");

render();

// Crear administrativo
form.addEventListener("submit", function(e){
    e.preventDefault();

    let admin = {
        identificacion: document.getElementById("identificacion").value,
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    admins.push(admin);

    localStorage.setItem("administrativos", JSON.stringify(admins));

    form.reset();

    render();
});

// Eliminar administrativo
function eliminar(index){

    if(confirm("Â¿Seguro que deseas eliminar este administrativo?")){

        admins.splice(index,1);

        localStorage.setItem("administrativos", JSON.stringify(admins));

        render();

    }

}

// Mostrar administrativos
function render(){

    lista.innerHTML = "";

    admins.forEach((admin, index) => {

        lista.innerHTML += `
        <li>
            <strong>${admin.nombres} ${admin.apellidos}</strong> - ${admin.email}
            <button onclick="eliminar(${index})">Eliminar</button>
        </li>
        `;

    });

}