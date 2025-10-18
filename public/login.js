
const form = document.getElementById('loginform');

form.addEventListener("submit", async (e)=> {
    e.preventDefault();


const username = document.getElementById('email').value;
const password = document.getElementById('password').value;

try{
    const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    const data = await response.json();
    alert(data.message);
}catch(error){
    alert("Error: could not connect to the server.");
    console.error(error)

}
});