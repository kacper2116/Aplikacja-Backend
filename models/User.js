const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        username: {type: String, required: true, unique: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        isAdmin: {
            type: Boolean, 
            default: false,
        },
        
    },
    {timestamps: true}
)

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

const GuestSchema = new mongoose.Schema(

    {
        email: {type: String, required: true, unique: true},
        isAdmin: {
            type: Boolean, 
            default: false,
        },
        
    },
    {timestamps: true}
)


module.exports = mongoose.model("User", UserSchema)
