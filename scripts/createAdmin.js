// backend/scripts/createAdmin.js
// Run with: node scripts/createAdmin.js

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Admin from "../src/models/AdminModel.js";

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "theapicommunity@gmail.com";
const ADMIN_PASSWORD = "theapi@9202"; // ← Your chosen password

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log("⚠️  Admin already exists with email:", ADMIN_EMAIL);
      process.exit(0);
    }

    const admin = new Admin({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    await admin.save();
    console.log("🎉 Admin created successfully!");
    console.log("   Name   :", ADMIN_NAME);
    console.log("   Email  :", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("\n🔐 Please change the password after first login.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createAdmin();
