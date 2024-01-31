import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const connectDB = async()=>{
    try {
        const connection_instance =await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)

        console.log(` MongoDB connected!!  ${connection_instance.connection.host}`)
        
    } catch (error) {

        console.log(`MongoDB connection error: ${error}`)
        
    }
}

export default connectDB