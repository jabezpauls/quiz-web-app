const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 } // Make sure this exists
});

module.exports = mongoose.model('User', UserSchema);
