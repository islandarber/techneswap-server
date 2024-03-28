import Chat from "../models/Chat.js";

export const getChats = async (req, res) => {
  const {sender, receiver} = req.query;
  try {
    const chats = await Chat.find({ sender, receiver }).populate("sender receiver").sort({ timestamp: 1 });
    if (chats && chats.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  const chat = req.body;
  const newChat = new Chat(chat);
  try {
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};