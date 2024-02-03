const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
    {
        userInfo: {
            userId: { type: String },
            guestEmail: { type: String },
          },
        
        products: [
            {title:{type:String},coverImg: {type:String},platform: {type:String},publisher:{type:String},price: {type:Number}, key: {type:String}, received: {type:Boolean}}
         ],
        paymentMethod: {type: String, required: true},
        currency: {type:String, required:true},
        quantity: {type: Number, required: true},
        orderValue: {type: Number, required: true},
        status: {type: String, default: 'Pending'},
 
    },
    {timestamps: true}
)

module.exports = mongoose.model("Order", OrderSchema)