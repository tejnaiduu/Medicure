const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { User, History } = require('./Models/Model');
const verify = require('./Verification/verify');
const { getChatResponse } = require('./Chat/chat');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// ✅ Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });
    res.status(201).send({ message: "Registration successful" });
  } catch (err) {
    res.status(500).send({ message: 'Internal server error', error: err });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).send({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.TOKEN, { expiresIn: '1h' });
    res.status(200).send({ message: "Login successful", token });
  } catch (err) {
    res.status(500).send({ message: "Internal server error", error: err });
  }
});

// ✅ Chat Endpoint (Fixed to return full chat)
app.post('/chat', verify, async (req, res) => {
  const userId = req.user.userId;
  const { query } = req.body;

  try {
    const response = await getChatResponse(query);
    const chat = await History.create({ userId, query, response });

    return res.status(200).json({ message: "Chat response generated successfully", chat });
  } catch (error) {
    console.error("Error in chat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get History
app.get('/history', verify, async (req, res) => {
  const userId = req.user.userId;

  try {
    const history = await History.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ message: "History retrieved successfully", history });
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete All History
app.delete('/history', verify, async (req, res) => {
  const userId = req.user.userId;

  try {
    await History.deleteMany({ userId });
    res.status(200).json({ message: "All history deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete Specific History by ID (Fixed)
app.delete('/history/:id', verify, async (req, res) => {
  const userId = req.user.userId;
  const historyId = req.params.id;

  try {
    const deleted = await History.findOneAndDelete({ _id: historyId, userId });
    if (!deleted) {
      return res.status(404).json({ message: "History item not found" });
    }

    return res.status(200).json({ message: "History item deleted successfully" });
  } catch (error) {
    console.error("Error deleting history item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start Server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
