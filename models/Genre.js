const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema(
    {
      name: {type: String},
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Genre", GenreSchema);