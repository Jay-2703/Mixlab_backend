import bcrypt from 'bcrypt';
import db from '../config/db.js';

//registration

let users = [];
let idCounter = 1;
const saltRounds = 10

class User {
  constructor({ username, email, password }) {
    this.id = idCounter++;
    this.username = username;
    this.email = email;
    this.password = password; // In production, hash this!
  }

  static async register({ username, email, password }) {
    const existing = users.find(u => u.email === email);
    if (existing) throw new Error('Email already exists');
    const newUser = new User({ username, email, password });
    users.push(newUser);
    return newUser;
  }

  static async findByEmail(email) {
    return users.find(u => u.email === email);
  }
}



const User = {
  create: async ({ name, email, password, role = 'user' }) => {
    const hashed = await bcrypt.hash(password, saltRounds);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );
    return { id: result.insertId, name, email, role };
  },

  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  updatePassword: async (id, newPassword) => {
    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  },

  setResetToken: async (id, token, expiry) => {
    await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [token, expiry, id]);
  }
};


export default User;
