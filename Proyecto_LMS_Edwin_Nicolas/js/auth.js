const loginForm = document.getElementById("loginForm")

loginForm.addEventListener("submit", function (e) {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    let admins = JSON.parse(localStorage.getItem("administrativos")) || []

    const user = admins.find(a => a.email === email && a.password === password)

    if (user) {
        sessionStorage.setItem("usuarioActivo", JSON.stringify(user))
        window.location = "dashboard.html"
    } else {
        alert("Credenciales incorrectas")
    }
})