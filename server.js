import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';


dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);

// Serve frontend files from "public" folder
app.use(express.static("public"));

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});





















/*import express from 'express';
import cors from 'cors'
import { connectToDatabase } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';



const app = express()
app.use(express.json())
app.use(cors());
app.use('/auth', authRouter)

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});

app.get('/', (req, res)=> {
    res.send("api is running");
});

connectToDatabase()
  .then(() => {
    console.log("Database connection successful!");
    app.listen(process.env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
*/