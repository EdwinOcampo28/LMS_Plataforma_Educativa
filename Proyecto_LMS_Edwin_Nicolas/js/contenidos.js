// =========================
// UTILIDADES
// =========================
function guardar(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function cargar(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

let contenidos = cargar("contenidos");
let editandoIndex = null;

// =========================
// ELEMENTOS
// =========================
const contenidoForm = document.getElementById("contenidoForm");
const contenidosCards = document.getElementById("contenidosCards");

const cursoInput = document.getElementById("cursoContenido");
const tituloInput = document.getElementById("tituloContenido");
const videoInput = document.getElementById("videoContenido");
const docInput = document.getElementById("documentoContenido");
const imgInput = document.getElementById("imagenContenido");
const enlaceInput = document.getElementById("enlaceContenido");

// =========================
// FORMULARIO
// =========================
contenidoForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!cursoInput.value || !tituloInput.value) {
        alert("El curso y el título son obligatorios");
        return;
    }

    const nuevoContenido = {
        curso: cursoInput.value,
        titulo: tituloInput.value,
        video: videoInput.value,
        documento: docInput.value,
        imagen: imgInput.value,
        enlace: enlaceInput.value
    };

    if (editandoIndex !== null) {
        contenidos[editandoIndex] = nuevoContenido;
        editandoIndex = null;
    } else {
        contenidos.push(nuevoContenido);
    }

    guardar("contenidos", contenidos);
    contenidoForm.reset();
    renderContenidos();
});

// =========================
// FUNCION COLOR DINAMICO
// =========================
function colorPorCurso(curso) {
    const colores = [
        "#f9fafb", "#e0f2fe", "#fef3c7", "#ede9fe", "#dcfce7", "#fee2e2",
        "#fef2f2", "#f0fdfa", "#fff7ed", "#fefce8"
    ];
    let hash = 0;
    for (let i = 0; i < curso.length; i++) {
        hash += curso.charCodeAt(i);
    }
    return colores[hash % colores.length];
}

// =========================
// RENDER CARDS GRID
// =========================
function renderContenidos() {
    contenidosCards.innerHTML = contenidos.map((c, i) => `
        <div class="card" style="background:${colorPorCurso(c.curso)}">
            <div style="background:#00000033; padding:4px 8px; border-radius:6px; color:#000; font-weight:600; display:inline-block; margin-bottom:8px;">
                ${c.curso}
            </div>
            ${c.imagen ? `<img src="${c.imagen}" alt="Imagen" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">` : ""}
            <h3 style="margin-top:10px;">${c.titulo}</h3>
            ${c.video ? `<p><a href="${c.video}" target="_blank">Ver Video</a></p>` : ""}
            ${c.documento ? `<p><a href="${c.documento}" target="_blank">Documento</a></p>` : ""}
            ${c.enlace ? `<p><a href="${c.enlace}" target="_blank">Enlace externo</a></p>` : ""}
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button onclick="editarContenido(${i})">Editar</button>
                <button onclick="eliminarContenido(${i})">Eliminar</button>
            </div>
        </div>
    `).join("");
}

// =========================
// EDITAR / ELIMINAR
// =========================
function editarContenido(i) {
    const c = contenidos[i];
    cursoInput.value = c.curso;
    tituloInput.value = c.titulo;
    videoInput.value = c.video;
    docInput.value = c.documento;
    imgInput.value = c.imagen;
    enlaceInput.value = c.enlace;
    editandoIndex = i;
}

function eliminarContenido(i) {
    if (confirm("¿Deseas eliminar este contenido?")) {
        contenidos.splice(i, 1);
        guardar("contenidos", contenidos);
        renderContenidos();
    }
}

// =========================
// INICIALIZAR
// =========================
renderContenidos();