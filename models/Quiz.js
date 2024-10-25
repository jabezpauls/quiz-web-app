const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questions: [
    {
      question: String,
      choices: [String],
      answer: String
    }
  ]
});

module.exports = mongoose.model("Quiz", quizSchema);
