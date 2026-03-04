const form = document.getElementById("contenidoForm");
const tabla = document.querySelector("table");

let contenidos = JSON.parse(localStorage.getItem("contenidos")) || [];

function mostrarContenidos() {

    tabla.innerHTML = `
<tr>
<th>Curso</th>
<th>Título</th>
<th>Video</th>
<th>Documento</th>
<th>Imagen</th>
<th>Enlace</th>
<th>Acciones</th>
</tr>
`;

    contenidos.forEach((contenido, index) => {

        tabla.innerHTML += `
<tr>

<td>${contenido.curso}</td>
<td>${contenido.titulo}</td>
<td>${contenido.video}</td>
<td>${contenido.documento}</td>
<td>${contenido.imagen}</td>
<td>${contenido.enlace}</td>

<td>
<button onclick="eliminarContenido(${index})">Eliminar</button>
</td>

</tr>
`;

    });

}

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const nuevoContenido = {

        curso: document.getElementById("curso").value,
        titulo: document.getElementById("titulo").value,
        video: document.getElementById("video").value,
        documento: document.getElementById("documento").value,
        imagen: document.getElementById("imagen").value,
        enlace: document.getElementById("enlace").value

    };

    contenidos.push(nuevoContenido);

    localStorage.setItem("contenidos", JSON.stringify(contenidos));

    form.reset();

    mostrarContenidos();

});

function eliminarContenido(index) {

    contenidos.splice(index, 1);

    localStorage.setItem("contenidos", JSON.stringify(contenidos));

    mostrarContenidos();

}

mostrarContenidos();