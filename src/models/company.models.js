const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        businessName: {
            type:String,
            required:true,
            trim:true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phoneNum: {
            type: String,
            required: true,
            unique: true
        },

        address: {
            street: String,
            city: String,
            state: String,
            pincode: String
        }
}, {timestamps:true});

module.exports = mongoose.model("Company", companySchema)