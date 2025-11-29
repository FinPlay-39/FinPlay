import express from "express";
import {
    getAllSplits,
    createSplit,
    recordSettlement,
    deleteSettlement,
    settleSettlement,
    getAllUsernames
} from "../controllers/splitsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// List all splits
router.get("/", protect, getAllSplits);

// Create new split
router.post("/", protect, authorizeRoles("user", "admin"), createSplit);

router.get("/usernames", protect, getAllUsernames);
// Record settlements
router.post("/:id/settle", protect, authorizeRoles("user", "admin"), recordSettlement);

router.delete("/:id", protect, deleteSettlement);
router.patch("/:id/settle", protect, settleSettlement);

export default router;

