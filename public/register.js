const form = document.getElementById('registerForm');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirm_password = document.getElementById('confirm-password').value;

  if (password !== confirm_password) return alert("Passwords do not match");

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Error connecting to server");
  }
});
