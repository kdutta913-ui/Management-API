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
        console.log(req.body)
        const allowedAddressFields = ["street", "city", "state", "pincode"]
        const updates = {}

        Object.keys(req.body).forEach((field) =>{
            if(field === "address"){
                allowedAddressFields.forEach((addressField)=>{
                    if(req.body[field]?.[addressField] !== undefined){
                        updates[`${field}.${addressField}`] = req.body[field][addressField]
                    }
                })
            }else{ 
                updates[field] = req.body[field]   
            }
        })
        if(Object.keys(updates).length === 0){
            return res.status(400).json({message:"No valid fields provided for update."})
        }
        
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
}