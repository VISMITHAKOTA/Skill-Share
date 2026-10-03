import SwapRequest from "../models/SwapRequest.js";

// 📤 SEND SWAP REQUEST
export const sendSwapRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot swap with yourself" });
    }

    const existing = await SwapRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const swap = await SwapRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ACCEPT / REJECT SWAP
export const respondToSwap = async (req, res) => {
  try {
    const { status } = req.body;
    const swapId = req.params.id;
    const userId = req.user.id;

    const swap = await SwapRequest.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: "Swap not found" });
    }

    // Only receiver can respond
    if (swap.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    swap.status = status; // accepted / rejected / completed
    await swap.save();

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 GET MY SWAPS
export const getMySwaps = async (req, res) => {
  try {
    const userId = req.user.id;

    const swaps = await SwapRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name")
      .populate("receiver", "name");

    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};