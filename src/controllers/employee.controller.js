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
        if (error.code === 11000) {
            if (error.keyPattern.email) {
                return res.status(409).json({message:"Email already exists."})
            } 
            else if(error.keyPattern.phoneNum) {
                return res.status(409).json({message:"Phone number already exists."})
            }
        } 
        else {
            res.status(500).json({message: "Server error", error:error.message})
        }

    }
};

const getEmployees = async (req,res) =>{
    try {
        const employees =  await Employee.find()
        res.status(200).json({employees})
        }
    catch (error) {
        console.log(error)
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const getEmployeeById = async (req,res)=>{
    try {
        const employee = await Employee.findById(req.params.id)
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists"})
        }
        res.status(200).json({employee})
    } catch (error) {
        console.log(error)
        if(error.name === "CastError"){
            return res.status(400).json({message:"Invalid Employee ID."})
        }
        res.status(500).json({message:"Server error", error:error.message})
    }
}

const updateEmployee = async(req,res)=>{
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        )
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists."})
        }
        res.status(200).json({message:"Employee updated successfully", employee})
    } catch (error) {
        console.log(error)
        if (error.code === 11000) {
            if (error.keyPattern.email) {
                return res.status(409).json({message:"Email already exists"})
            } else if(error.keyPattern.phoneNum){
                return res.status(409).json({message:"Phone number already exists"})
            }
        } 
        else {
            res.status(500).json({message:"Server error", error: error.message})
        }
    }
}

const deleteEmployee = async(req,res)=>{
    try {
        const employee = await Employee.findByIdAndDelete(
        req.params.id
        )
        if(!employee){
            return res.status(404).json({message: "Employee doesn't exists."})
        }
        res.status(200).json({message:"Deleted successfully", employee})
    } catch (error) {
        console.log(error)
        if(error.name === "CastError"){
            return res.status(400).json({message:"Invalid Employee ID."})
        }
        res.status(500).json({message:"Server error", error: error.message})
    }
}

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};