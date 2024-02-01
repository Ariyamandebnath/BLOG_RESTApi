import dotenv from 'dotenv';
import connectDB from './db/db.js';
import app from './app.js';


dotenv.config({
    path:'./.env'
})


connectDB()
.then()
.catch();
