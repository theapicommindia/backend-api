// backend/server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import adminRoutes from "./src/routes/admin.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import connectDB from "./lib/db.js";

const app = express();

// 🚨 REQUIRED for Render to send/receive secure cookies
app.set("trust proxy", 1);

// 🔥 Restoring your robust array-based CORS setup
const allowedOrigins = [
  "http://localhost:5173", 
  "https://the-api-community.vercel.app" // Ensure there is NO trailing slash here
];

// Add FRONTEND_URL from Render env variables if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // This is mandatory to allow cookies to pass through
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// 🔥 THE MAGIC ERROR HANDLER 🔥
// This intercepts crashes and forces Express to send JSON instead of HTML
app.use((err, req, res, next) => {
    console.error("🚨 BACKEND CRASH:", err);
    
    // Check if it's a file upload error
    if (err.name === 'MulterError') {
        return res.status(400).json({ success: false, message: `Multer Error: ${err.message}`, field: err.field });
    }

    // Default to 500 Server Error
    res.status(500).json({ 
        success: false, 
        message: "Server encountered an error before reaching the controller", 
        error: err.message || "Unknown Error"
    });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server :", error.message);
  }
};

startServer();