import { apiCall } from 'api.js';

const form = document.getElementById('registerForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await apiCall('api/auth/register', 'POST', {
        username,
        email,
        password
      });

      alert(response.message);
      
      // Redirect to login page
      if (response.user) {
        window.location.href = 'login.html';
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}
