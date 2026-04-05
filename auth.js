let isLogin = true;

function toggleMode(){

isLogin = !isLogin;

document.getElementById("formTitle").innerText = isLogin ? "Login" : "Sign Up";

document.querySelector("button").innerText = isLogin ? "Login" : "Sign Up";

document.getElementById("toggleText").innerHTML = isLogin
? `Don't have an account? <span onclick="toggleMode()">Sign up</span>`
: `Already have an account? <span onclick="toggleMode()">Login</span>`;

}

function handleAuth(){

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;

if(!username || !password){
alert("Please fill all fields");
return;
}

let users = JSON.parse(localStorage.getItem("users")) || {};

if(isLogin){

if(users[username] === password){
localStorage.setItem("loggedInUser", username);
window.location.href = "index.html";
}else{
alert("Invalid credentials");
}

}else{

users[username] = password;
localStorage.setItem("users", JSON.stringify(users));
alert("Signup successful! Please login.");
toggleMode();

}

}