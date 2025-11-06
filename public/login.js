import { apiCall } from 'api.js';

const form = document.getElementById('loginform');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    try {
      const response = await apiCall('/auth/login', 'POST', {
        email,
        password
      });

      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      alert(response.message);
      
      // Redirect to dashboard or home
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}
