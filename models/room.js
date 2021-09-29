const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  created_at: mongoose.Schema.Types.Date,
  last_active: mongoose.Schema.Types.Date,
  auth_type: String,
  auth_password: String,
  public: Boolean,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approved_users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
})

module.exports = mongoose.model("Room", roomSchema);
