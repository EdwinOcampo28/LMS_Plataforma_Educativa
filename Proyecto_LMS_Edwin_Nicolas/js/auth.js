
document.getElementById("loginForm").addEventListener("submit",e=>{
e.preventDefault()

let email=document.getElementById("email").value
let password=document.getElementById("password").value

let admins=JSON.parse(localStorage.getItem("administrativos"))||[]

let admin=admins.find(a=>a.email===email && a.password===password)

if(admin){

window.location="dashboard.html"

}else{

alert("Credenciales incorrectas")

}

})
