const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phoneNum:{
        type: String,
        required: true,
        unique: true,
    },
    department:{
        type:String
    },
    designation:{
        type:String
    },
    salary:{
        type:Number,
        default: 0
    },
    dateOfJoining:{
        type: Date,
    },
    address:{
        street: String,
        city: String,
        state: String,
        pincode: String,
    },
    bankDetails:{
        accountNumber: String,
        ifscCode: String,
        accountName: String,
        bankName: String,
    },
},{timestamps:true})

module.exports = mongoose.model("Employee", employeeSchema);