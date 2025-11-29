import Split from "../models/Splits.js";
import Settlement from "../models/Settlement.js";
import mongoose from "mongoose";
import User from "../models/User.js";

// @desc Get all usernames
// @route GET /api/users/usernames
// @access Private
export const getAllUsernames = async (req, res) => {
    try {
        // Fetch only the username + optionally name
        const users = await User.find({}, "username name").lean();

        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching usernames", 
            error: error.message 
        });
    }
};

// @desc Get all splits for current user
// @route GET /api/splits
// @access Private
export const getAllSplits = async (req, res) => {
    try {
        const splits = await Split.find({ participants: req.user._id })
            .populate("participants", "name email")
            .populate({
                path: "settlements",      // populate the ObjectIds
                populate: [
                    { path: "from", select: "name email" },
                    { path: "to", select: "name email" }
                ]
            })
            .lean();

        res.json(splits);
    } catch (error) {
        res.status(500).json({ message: "Error fetching splits", error: error.message });
    }
};

// @desc Create new split + settlements
// @route POST /api/splits
// @access Private
// controllers/splitController.js
export const createSplit = async (req, res) => {
    const { title, participants, mode, transactions } = req.body;

    try {
        const split = await Split.create({
            userId: req.user._id,
            title,
            participants,
            mode,
        });
        let settlementIds = [];
        if (transactions && transactions.length > 0) {
            const settlements = await Promise.all(transactions.map(tx =>
                Settlement.create({ splitId: split._id, ...tx })
            ));
            settlementIds = settlements.map(s => s._id);

            // 3ï¸â£ Update split with settlements
            split.settlements = settlementIds;
            await split.save();
        }

        // return the full split object (including _id)
        res.status(201).json(split);
    } catch (error) {
        res.status(500).json({ message: "Error creating split", error: error.message });
    }
};


// @desc Record additional settlements for a split
// @route POST /api/splits/:id/settle
// @access Private
export const recordSettlement = async (req, res) => {
    const { transactions } = req.body;
    const splitId = req.params.id;

    try {
        // Create one Settlement per transaction
        const createdSettlements = await Promise.all(
            transactions.map(t =>
                Settlement.create({
                    splitId: new mongoose.Types.ObjectId(splitId),
                    from: new mongoose.Types.ObjectId(t.from),
                    to: new mongoose.Types.ObjectId(t.to),
                    amount: t.amount,
                })
            )
        );

        res.status(201).json(createdSettlements);
    } catch (error) {
        console.error("Settlement creation error:", error);
        res.status(500).json({ message: "Error recording settlement", error: error.message });
    }
};


// @desc Delete a split
// @route DELETE /api/splits/:id
// @access Private
export const deleteSplit = async (req, res) => {
    try {
        const split = await Split.findByIdAndDelete(req.params.id);
        if (!split) return res.status(404).json({ message: "Split not found" });
        res.json({ message: "Split deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting split", error: error.message });
    }
};
// DELETE a settled settlement
export const deleteSettlement = async (req, res) => {
    try {
        const settlement = await Settlement.findById(req.params.id);

        if (!settlement) {
            return res.status(404).json({ message: "Settlement not found" });
        }

        // only allow deletion if settled
        if (!settlement.settled) {
            return res.status(400).json({ message: "Cannot delete an unsettled settlement" });
        }

        await settlement.deleteOne();
        // update parent split
        const split = await Split.findById(settlement.splitId);
        if (!split) return res.status(404).json({ message: "Parent split not found" });

        // remove this settlement from the split
        split.settlements = split.settlements.filter(sId => sId.toString() !== settlement._id.toString());

        // if no settlements left, set to null
        if (split.settlements.length === 0) {
            split.settlements = null;       // or [] if you prefer
            split.completed = true;         // optional: mark split completed
        }

        await split.save();
        res.json({ message: "Settlement deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH: mark settlement as settled
export const settleSettlement = async (req, res) => {
    try {
        const settlement = await Settlement.findById(req.params.id);
        if (!settlement) return res.status(404).json({ message: "Settlement not found" });

        settlement.settled = true;
        await settlement.save();
        res.json({ message: "Settlement marked as settled" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

