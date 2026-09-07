const Employee = require('../models/employee.models')

const createEmployee = async (req,res) => {
    try {
        const {name, phoneNum, email} = req.body
        if(!name || !phoneNum || !email){
            return res.status(400).json({message:"Name, email and phone number are required."})
        }

        const employee = await Employee.create({
            name,
            email,
            phoneNum,
        })
        res.status(201).json({message: "Employee created successfully", employee})
    } catch (error) {
        console.log(error)
        if(error.code === 11000){
            return res.status(409).json({message:"Email already exists"})
        }
        res.status(500).json({message:"Server error", error: error.message})
    }
};

module.exports = {
    createEmployee
};