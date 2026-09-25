const { allowedAddressFields } = require('../constants/employeeFields');
const Employee = require('../models/employee.models')
const User = require("../models/user.models")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const createEmployee = async (req,res,next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { name, email, phoneNum, password, department, designation, salary } = req.body;

        //check email
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(409).json({message: "User with this email already exists"})
        }

        //check phone number
        const existingPhone = await User.findOne({phoneNum});
        if(existingPhone){
            return res.status(409).json({message:"User with this phone number already exists"})
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const [user] = await User.create([{
            name,
            email,
            phoneNum,
            password: hashedPassword,
            role: "Employee",
            isActive: true
        }],
        {session}
    )
    console.log("USER CREATED:", user._id);
        const [employee] = await Employee.create([{
            userId: user._id,
            department,
            designation,
            salary
        }],
        {session}
    );

    //commit transaction
    await session.commitTransaction();
    return res.status(201).json({message: "Employee created successfully", userId: user._id, employeeId: employee._id})
    } catch (error) {
        await session.abortTransaction();
        console.log("CREATE EMPLOYEE ERROR:", error);
        next(error)
    } finally{
        await session.endSession();
    }
};

const getEmployees = async (req,res, next) =>{
    try {
        const employees =  await Employee
        .find()
        .populate(
            "userId", 
            "name email phoneNum role isActive"
        )
        return res.status(200).json({
            message: "Employee fetched successfully",
            count: employees.length,
            employees})
        }
    catch (error) {
        next(error)
    }
};

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