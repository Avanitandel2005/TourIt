const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  Username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  mobilenumber: {
    type: String,
    required: true
  }
});

const user = mongoose.model('User', UserSchema);
module.exports = user;
