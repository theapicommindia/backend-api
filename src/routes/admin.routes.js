import express from "express";
import {
    AdminLogin,
    verifyAdminLogin,
    createEvent,
    updateEvent,
    deleteEvent,
    getAdminDashboard,
    getAllApplicants,
    AdminLogout,
    checkAuth
} from "../controllers/admin.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Existing Routes
router.post("/login", AdminLogin);
router.post("/verify", verifyAdminLogin);
router.post("/add-event", verifyAdmin, upload.fields([{ name: 'eventImages' }, { name: 'speakerImages' }]), createEvent);
router.put("/update-event/:id", verifyAdmin, upload.fields([{ name: 'eventImages' }, { name: 'speakerImages' }]), updateEvent); // Note: Added verifyAdmin here for security
router.delete("/delete-event/:id", verifyAdmin, deleteEvent);
router.get("/dashboard", verifyAdmin, getAdminDashboard);
router.get("/applicants", verifyAdmin, getAllApplicants);

// --- NEW ROUTES ---
// http://localhost:5001/api/admin/check-auth
router.get("/check-auth", verifyAdmin, checkAuth);



//http://localhost:5001/api/admin/applicants
router.get("/applicants", verifyAdmin,getAllApplicants);

router.post("/logout",AdminLogout);
export default router;