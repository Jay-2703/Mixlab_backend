// User.js
let users = [];
let idCounter = 1;

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

export default User;
