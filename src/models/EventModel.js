// backend/src/models/EventModel.js
import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    linkedIn_Profile: { type: String },
    speaker_Image_Url: { type: String, required: true }, // Each speaker gets their own unique pfp
    bio: { type: String }
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    short_Description: { type: String, required: true },
    detailed_Description: { type: String, required: true },
    date: { type: Date, required: true }, 
    time: { type: String }, // Optional for "done" events
    event_Location: { type: String, required: true },
    image_Urls: { type: [String] }, // The collection of event photos
    speakers: [speakerSchema] // The collection of speakers
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);