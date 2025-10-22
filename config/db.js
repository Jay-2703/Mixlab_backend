import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let connection;
const connectToDatabase = async() => {
    if(!connection){
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            
        });
    console.log('Connected to the database!');

    }
    return connection 
    
};

export { connectToDatabase };
