// backend/scripts/resetAdmin.js
// Run with: node scripts/resetAdmin.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Admin from "../src/models/AdminModel.js";

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "theapicommunity@gmail.com";
const ADMIN_PASSWORD = "theapi@9202"; // ← Your chosen password

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    // Delete existing admin with this email
    const deleted = await Admin.deleteOne({ email: ADMIN_EMAIL });
    if (deleted.deletedCount > 0) {
      console.log("🗑️  Deleted existing admin:", ADMIN_EMAIL);
    }

    // Create fresh admin (password gets hashed by the pre-save hook)
    const admin = new Admin({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    await admin.save();
    console.log("🎉 Admin reset successfully!");
    console.log("   Email   :", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

resetAdmin();
