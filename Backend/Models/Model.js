
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
 },
  password: {
     type: String,
     required: true,
 }
    
}, {timestamps: true});

const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
const History = mongoose.model('History', HistorySchema);

module.exports = { User, History };
