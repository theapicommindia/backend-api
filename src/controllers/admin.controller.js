//backend/src/controllers/admin.controller.js
import express from "express";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import Admin from "../models/AdminModel.js";
import Event from "../models/EventModel.js"; // Ensure this is your single, correct Event model
import Applicant from "../models/ApplicantModel.js";
import Otp from "../models/OtpModel.js";
import { sendOtpEmail } from "../utils/email.utils.js";

// Generate JWT token
const generateAdminToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Set JWT in HTTP-only cookie
// Set JWT in HTTP-only cookie
const sendAdminCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 👈 Critical for cross-domain
    secure: process.env.NODE_ENV === "production",                    // 👈 Critical for cross-domain
    path: "/",
  });
};

// Generate 6-digit OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Admin Login Initiation
export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await Otp.deleteMany({ email, purpose: "login", verified: false });
      await Otp.create({ email, code, purpose: "login", expiresAt });
      await sendOtpEmail({ to: email, code });

      return res.status(200).json({
        success: true,
        message: "Password verified. OTP sent to admin email.",
        email: admin.email,
      });
    } else {
      return res.status(401).json({ success: false, error: "Invalid Admin Credentials." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error." });
  }
};

export const AdminLogout = async (req,res)=>{
  res.clearCookie("token", { 
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/" 
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
// Verify OTP & Authenticate Admin
export const verifyAdminLogin = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Email and OTP code are required." });
    }

    const otpDoc = await Otp.findOne({ email, code, purpose: "login", verified: false });
    
    if (!otpDoc) return res.status(400).json({ success: false, error: "Invalid or expired OTP." });
    if (otpDoc.expiresAt < new Date()) return res.status(400).json({ success: false, error: "OTP has expired." });

    otpDoc.verified = true;
    await otpDoc.save();

    const admin = await Admin.findOne({ email });
    const token = generateAdminToken(admin._id, admin.email);
    sendAdminCookie(res, token);

    res.status(200).json({
      success: true,
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      message: "Authentication successful.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error." });
  }
};

// Create a new event with images
export const createEvent = async (req, res) => {
  try {
    const eventImageUrls = req.files['eventImages'] ? req.files['eventImages'].map(file => file.path) : [];
    const speakerImageFiles = req.files['speakerImages'] || [];

    if (!req.body.speakers) {
      return res.status(400).json({ success: false, message: "No speaker data provided." });
    }

    let speakersData;
    try {
      speakersData = JSON.parse(req.body.speakers);
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid JSON format for speakers." });
    }

    // Map speakers to their respective images
    const finalSpeakers = speakersData.map((speaker, index) => ({
      name: speaker.name,
      linkedIn_Profile: speaker.linkedIn_Profile,
      bio: speaker.bio,
      speaker_Image_Url: speakerImageFiles[index] ? speakerImageFiles[index].path : null
    }));

    const missingImage = finalSpeakers.some(s => !s.speaker_Image_Url);
    if (missingImage) {
      return res.status(400).json({ success: false, message: "Every speaker must have a profile image uploaded." });
    }

    const newEvent = new Event({
      title: req.body.title,
      short_Description: req.body.short_Description,
      detailed_Description: req.body.detailed_Description,
      date: req.body.date,
      time: req.body.time,
      event_Location: req.body.event_Location,
      image_Urls: eventImageUrls,
      speakers: finalSpeakers 
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({ success: true, data: savedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating event", error: error.message });
  }
};

//Update event
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // 1. Fetch the existing event first to safely merge data
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 2. Process New Event Gallery Images (if any were uploaded)
    const newEventImageUrls = req.files && req.files['eventImages'] 
        ? req.files['eventImages'].map(file => file.path) 
        : [];
        
    // Combine existing images with the newly uploaded ones
    const updatedEventImages = [...existingEvent.image_Urls, ...newEventImageUrls];

    // 3. Process Speakers Data
    let finalSpeakers = existingEvent.speakers; // Fallback to existing speakers

    if (req.body.speakers) {
        let speakersData;
        try {
            speakersData = JSON.parse(req.body.speakers);
        } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid JSON format for speakers." });
        }

        const speakerImageFiles = (req.files && req.files['speakerImages']) || [];
        
        finalSpeakers = speakersData.map((speaker, index) => {
            // If a new file was uploaded at this index, use the new Cloudinary path.
            // Otherwise, keep the existing 'speaker_Image_Url' sent from the frontend JSON.
            const newlyUploadedProfilePic = speakerImageFiles[index] ? speakerImageFiles[index].path : null;
            
            return {
                name: speaker.name,
                linkedIn_Profile: speaker.linkedIn_Profile,
                bio: speaker.bio,
                speaker_Image_Url: newlyUploadedProfilePic || speaker.speaker_Image_Url 
            };
        });
    }

    // 4. Exclude 'speakers' and 'image_Urls' from req.body so we don't accidentally overwrite our merged arrays
    const { speakers, image_Urls, image_Url, ...otherUpdates } = req.body;

    // 5. Save the updated document
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { 
        $set: {
            ...otherUpdates,
            image_Urls: updatedEventImages,
            speakers: finalSpeakers
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
        success: true, 
        message: "Event updated successfully", 
        data: updatedEvent 
    });

  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ 
        success: false, 
        message: "Error updating event", 
        error: error.message 
    });
  }
};

// Delete event and clean up Cloudinary assets
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const allUrls = [
      ...event.image_Urls,
      ...event.speakers.map(s => s.speaker_Image_Url)
    ].filter(url => url); 

    const getPublicId = (url) => {
      const parts = url.split('/');
      const fileName = parts.pop().split('.')[0];
      const folder = parts.pop();
      return `${folder}/${fileName}`;
    };

    const deletePromises = allUrls.map(url => cloudinary.uploader.destroy(getPublicId(url)));
    await Promise.all(deletePromises);

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Event and all media deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting event", error: error.message });
  }
};

// Retrieve all events for admin dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard data", error: error.message });
  }
};
// Get all applicants for the Admin Dashboard
export const getAllApplicants = async (req, res) => {
    try {
        // Fetch all applicants and sort by newest first
        const applicants = await Applicant.find({}).sort({ createdAt: -1 });

        // If you only want to send specific fields to make the payload lighter, you could do:
        // .select("name email phone status appliedAt")

        res.status(200).json({
            success: true,
            count: applicants.length,
            message: "Applicants retrieved successfully",
            data: applicants
        });

    } catch (error) {
        console.error("GET APPLICANTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch applicants",
            error: error.message
        });
    }
};

export const checkAuth = (req, res) => {
  // If the request passes the verifyAdmin middleware, they are authenticated
  res.status(200).json({ success: true, admin: req.admin });
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};