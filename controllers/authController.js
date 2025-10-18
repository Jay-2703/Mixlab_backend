

/*export const register = async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Incoming registration:', req.body);

  try {
    const db = await connectToDatabase();
    console.log('Connected to DB in controller');

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Query executed successfully');

    if (rows.length > 0) {
      console.log('User already exists');
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashPassword]
    );
    console.log('User inserted into database');

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(' Detailed error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

*/
/*
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { connectToDatabase } from '../config/db.js';

//Register Controller

export const register = async(req, res)=>{
    const {username, email, password} = req.body;
    try{
        const db = await connectToDatabase()
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
        if(rows.length  > 0){
            return res.status(409).json({message : "user already existed"})
        }

        const hashPassword = await bcrypt.hash(password, 10)
        await db.query("INSERT INTO users(username, email, password) VALUES (?,?,?)",
            [username, email, hashPassword])

        res.status(201).json({message: "user created successfully"});   
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }

}
*/

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { connectToDatabase } from '../config/db.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '../models/User.js';



// Helper functions for validation
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
      message: "Password must be at least 6 characters long and include at least 1 letter and 1 number" 
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


//RBAC 

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const user = await User.create({ name, email, password, role }); // role optional
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

