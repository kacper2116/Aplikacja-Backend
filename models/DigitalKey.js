const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const DigitalKeySchema = new mongoose.Schema(
    {
      gameId: {type: String},
      platform: {type: String},
      key: {type: String},
      received:{type:Boolean, default:false},
      orderId: { type: ObjectId, ref: 'Order' },
      productId: { type: ObjectId},
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("DigitalKey", DigitalKeySchema);