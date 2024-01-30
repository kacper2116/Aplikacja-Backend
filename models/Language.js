const mongoose = require("mongoose");

const LanguageSchema = new mongoose.Schema(
    {
      name: {type: String},
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Language", LanguageSchema);