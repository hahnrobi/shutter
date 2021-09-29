const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  profile_image_url: String,
  email: String,
  passwordHash: String
})

module.exports = mongoose.model("User", userSchema);
