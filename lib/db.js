import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Ensure you have the DB name in your URI, or pass it in the options
        const conn = await mongoose.connect(process.env.MONGO_URL);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

export default connectDB;