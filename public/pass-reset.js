// Determine which page by checking form IDs
const forgotForm = document.getElementById('forgotForm');
const otpForm = document.getElementById('otpForm');
const resetForm = document.getElementById('resetForm');


// --- 1. Send OTP ---
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    userEmail = document.getElementById('email').value;

    // Store email in localStorage so it persists across pages
    localStorage.setItem("userEmail", userEmail);
    console.log("Sending OTP to:", userEmail);

    try {
      const res = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      alert(data.message);
      if(res.ok) window.location.href = "send-code.html"; // go to OTP page
    } catch(err) { console.error(err); }
  });
}

// --- 2. Verify OTP ---
if (otpForm) {
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('code').value;
    const userEmail = localStorage.getItem("userEmail"); // get email from localStorage


    try {
      const res = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp })
      });
      const data = await res.json();
      alert(data.message);
      if(res.ok) window.location.href = "new-pass.html"; // go to reset password page
    } catch(err) { console.error(err); }
  });
}

// Helper function to validate password strength
function validatePassword(password) {
  // At least 6 characters, at least 1 letter and 1 number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return re.test(password);
}

// --- 3. Reset Password ---
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const userEmail = localStorage.getItem("userEmail");

    if (!newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      alert("Password must be at least 6 characters long and include at least 1 letter and 1 number");
      return;
    }

    console.log("🔑 Resetting password for:", userEmail);

    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, newPassword })
      });
      const data = await res.json();
      console.log("📝 Response from reset-password:", data);
      alert(data.message);

      if (res.ok) {
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  });
}


