const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String},
    products: {type:Array},
    total: {type: Number},
    quantity:{type:Number}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);