const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        coverImg: {type: String, required: true},
        wideImg: {type:String},
        price: {type: Number, required: true},
        publisher: {type: String, required: true},
        tags: {type: Array, required: true},
        category: {type:Array, required: false},
        platforms: {type: Array, required: true},

        details: {
            description: {type: String, required: true},
            gallery: {type: Array, required: true},
            requirements: {
                minimal: {type: Object, required: true},
                recommended: {type: Object, required: true},
            },
            release_date: {type: Date, reqired: true},
            languages: {type: Array, required: true},
        },
        isAvailable: {type: Boolean, default: true},

       
        
    },
    {timestamps: true}
)

module.exports = mongoose.model("Product", ProductSchema)