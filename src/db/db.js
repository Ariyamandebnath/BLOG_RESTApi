import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connection_instance = await mongoose.connect(`${process.env.MONGO_URI}`,{ useNewUrlParser: true, useUnifiedTopology: true });

        console.log(`MongoDB connected!! Host: ${connection_instance.connection.host}`);
        
    } catch (error) {
        console.error(`MongoDB connection error: ${error}`);
    }
};

export default connectDB;
