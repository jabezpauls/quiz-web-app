const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./models/User");

dotenv.config();
const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((error) => console.error("MongoDB connection error:", error));

// Define routes for HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/signup.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/quiz.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "quiz.html"));
});

app.get("/all-students.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "all-students.html"));
});
// User Registration
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: "User created!" });
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
      return res.status(400).send({ message: "Invalid username or password." });
  }

  // Compare password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
      return res.status(400).send({ message: "Invalid username or password." });
  }

  // Create JWT token
  const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET, // Secret key from environment variable
      { expiresIn: "1h" }
  );

  res.send({ token });
});



// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // Attach user info to the request
        next(); // Proceed to the next middleware or route handler
    });
};

// Sample protected route
app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
      // Find the user by their ID (from the token)
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).send({ message: "User not found" });
      }

      // Send username and score to the frontend
      res.send({
          username: user.username,
          score: user.score
      });
  } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).send({ message: "Error fetching user data" });
  }
});

const Question = require("./models/Question");

// API route to get quiz questions
app.get("/api/quiz-questions", async (req, res) => {
    try {
        const questions = await Question.find();
        res.send(questions);
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).send({ message: "Error fetching quiz questions" });
    }
});




app.post("/update-score", authenticateToken, async (req, res) => {
  const { score } = req.body;

  try {
    // Find the user by their ID (from the token)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Update the user's score
    user.score = score;
    await user.save();

    res.send({ message: "Score updated successfully", score: user.score });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).send({ message: "Error updating score" });
  }
});

app.post("/submit-quiz", authenticateToken, async (req, res) => {
  const { score } = req.body;
  const userId = req.user.id;  // Assuming user ID is decoded from the JWT token

  try {
      // Find the user by their ID and update their score
      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: { score } },  // Update score field
          { new: true }  // Return the updated user
      );

      if (!updatedUser) {
          return res.status(404).send({ message: "User not found" });
      }

      res.status(200).send({ message: "Score updated successfully", user: updatedUser });
  } catch (error) {
      console.error("Error updating score:", error);
      res.status(500).send({ message: "An error occurred while updating the score" });
  }
});

app.get("/all-students", async (req, res) => {
  try {
      // Fetch all users (only select username and score)
      const users = await User.find({}, "username score");

      res.send(users); // Send the list of users with their scores
  } catch (error) {
      console.error("Error fetching all students:", error);
      res.status(500).send({ message: "Error fetching students" });
  }
});




// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

