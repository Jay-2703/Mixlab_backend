import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { connectToDatabase } from '../config/db.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';


// import User from '../models/User.js'
// Helper functions for validation (REGex?) 
const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const validatePassword = (password) => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

// Register Controller
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Basic field check
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return res.status(400).json({ 
      message: "Password must be at least 8 characters long and include at least 1 letter and 1 number" 
    });
  }

  try {
    const db = await connectToDatabase();
    // Check if user already exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password and insert user
    const hashPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users(username, email, password) VALUES (?,?,?)",
      [username, email, hashPassword]
    );

    res.status(201).json({ message: "User created successfully" });   
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

    
};

//LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


//password reset
const OTP_EXPIRY_MINUTES = 10;
let otpStore = {}; // temporary in-memory store: { email: { code, expiresAt } }

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const db = await connectToDatabase();
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(404).json({ message: "Email not found" });

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
        otpStore[email] = { code: otp, expiresAt };

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"MixLab Studio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
        });

        res.json({ message: "OTP sent to your email" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// VERIFY OTP
export const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!otpStore[email]) return res.status(400).json({ message: "No OTP sent for this email" });

    if (Date.now() > otpStore[email].expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ message: "OTP expired" });
    }

    if (otpStore[email].code !== otp) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified" });
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!otpStore[email]) return res.status(400).json({ message: "OTP verification required" });

    try {
        const db = await connectToDatabase();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

        // Clear OTP
        delete otpStore[email];

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

//LOGOUT






//RBAC 
export const registerWithRole = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const db = await connectToDatabase();
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already used" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users(username, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);f
    res.status(500).json({ message: "Server error" });
  }
};

export const loginWithRole = async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




/*


///////// GUEST 

// 🧩 Helper: Link guest to new user
const linkGuestToUser = async (db, guestId, userId) => {
  try {
    // Transfer all game progress
    await db.query(
      'UPDATE game_progress SET user_id = ? WHERE guest_id = ?',
      [userId, guestId]
    );

    // Mark guest as linked
    await db.query(
      'UPDATE guest_users SET linked_user_id = ?, linked_at = NOW() WHERE guest_id = ?',
      [userId, guestId]
    );

    console.log(`✅ Guest ${guestId} linked to user ${userId}`);
  } catch (error) {
    console.error('Error linking guest to user:', error);
  }
};

// 🧱 REGISTER
export const registerUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { name, email, password } = req.body;
    const guestId = req.cookies?.guest_id; // 👈 Check guest cookie

    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, 'user']
    );

    const userId = result.insertId;

    // 👇 If guest exists, link their data
    if (guestId) {
      await linkGuestToUser(db, guestId, userId);
      res.clearCookie('guest_id'); // optional
    }

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// 🔐 LOGIN
export const loginUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { email, password } = req.body;
    const guestId = req.cookies?.guest_id;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // 👇 Link guest progress to this user on login
    if (guestId) {
      await linkGuestToUser(db, guestId, user.id);
      res.clearCookie('guest_id');
    }

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};


*/
