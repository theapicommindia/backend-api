// backend/src/controllers/user.controller.js
import express from 'express';
import Applicant from '../models/ApplicantModel.js';
import Admin from '../models/AdminModel.js'; 
import { sendAdminNotificationEmail } from '../utils/email.utils.js'; 
import Event from '../models/EventModel.js';

export const ApplicationControler = async (req, res) => {
   try {
    // 1. Log the incoming data so we can see what the frontend actually sent
    console.log("📥 Incoming Form Data:", req.body);

    const newApplication = new Applicant(req.body);
    const savedApplicant = await newApplication.save();

    try {
        const admin = await Admin.findOne(); 
        if (admin && admin.email) {
            await sendAdminNotificationEmail(req.body, admin.email);
        } else {
            console.error("⚠️ No admin found in database to receive notification.");
        }
    } catch (emailErr) {
        console.error("⚠️ Data saved, but failed to send email alert to admin:", emailErr);
    }

    res.status(201).json(savedApplicant);
   } catch(error) {
    // 2. THIS IS THE CRUCIAL PART - Print the exact MongoDB error to your terminal!
    console.error("🔥 MONGODB REJECTED THE SAVE. ERROR DETAILS:");
    console.error(error);

    if (error.code === 11000) {
        return res.status(400).json({ message: "This email is already registered." });
    }
    
    res.status(500).json({ message: "Error in creation a application", error: error.message });
   }
};

export const getPublicEvents = async (req, res) => {
  try {
    // Attempt to fetch all events from the database
    const events = await Event.find(); 
    res.status(200).json({ success: true, events });
  } catch (error) {
    // THIS PRINTS THE CRASH TO YOUR TERMINAL 👇
    console.error("🔥 ERROR FETCHING PUBLIC EVENTS:", error); 
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};