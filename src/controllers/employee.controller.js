const Employee = require('../models/employee.models')

const createEmployee = async (req,res,next) => {
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
        next(error)
    }
};

const getEmployees = async (req,res, next) =>{
    try {
        const employees =  await Employee.find()
        res.status(200).json({employees})
        }
    catch (error) {
        next(error)
    }
}

const getEmployeeById = async (req,res, next)=>{
    try {
        const employee = await Employee.findById(req.params.id)
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists"})
        }
        res.status(200).json({employee})
    } catch (error) {
        next(error)
    }
}

const updateEmployee = async(req,res,next)=>{
    try {
        const allowedFields = ["name", "email", "phoneNum", "department", "designation", "salary", "address"]
        const updates = {}
        allowedFields.forEach((field) =>{
            if(req.body[field] !== undefined){
                updates[field] = req.body[field]
            }
        })
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        )
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists."})
        }
        res.status(200).json({message:"Employee updated successfully", employee})
    } catch (error) {
        next(error)
    }
}

const deleteEmployee = async(req,res,next)=>{
    try {
        const employee = await Employee.findByIdAndDelete(
        req.params.id
        )
        if(!employee){
            return res.status(404).json({message: "Employee doesn't exists."})
        }
        res.status(200).json({message:"Deleted successfully", employee})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};