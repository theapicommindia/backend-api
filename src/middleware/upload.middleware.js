//backend/src/middleware/upload.middleware.js
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Initialize dotenv to ensure process.env variables are loaded
dotenv.config();

// Configure Cloudinary with your credentials from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up the Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college_events', // The folder name inside your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg'], // Restrict file types
    },
});

// Export the upload middleware with file and field size limits
export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit per file
        fieldSize: 25 * 1024 * 1024 // 25 MB limit for text fields (like the speakers JSON)
    }
});