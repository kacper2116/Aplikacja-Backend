const mongoose = require("mongoose");


const PlatformSchema = new mongoose.Schema(
    {
      name: {type: String},
      image: {type:String},
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Platform", PlatformSchema);