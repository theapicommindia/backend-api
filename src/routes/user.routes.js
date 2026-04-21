// backend/src/routes/user.routes.js
import express from "express";
import { ApplicationControler , getPublicEvents } from "../controllers/user.controller.js";

const router = express.Router();

router.post(`/application-form`, ApplicationControler);

router.get(`/events`, getPublicEvents);

router.get('/events', async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: -1 });
        res.status(200).json({ success: true, count: events.length, events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching events", error: error.message });
    }
});

export default router;
