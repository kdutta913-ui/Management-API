const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    phoneNum: {
        type: String,
        required: true,
        unique: true,
        match: [/^[0-9]{10}$/, "Invalid phone number"],
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["CompanyAdmin", "HR", "Finance", "TeamLead", "Employee"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},{timestamps:true})

module.exports = mongoose.model("User", userSchema);