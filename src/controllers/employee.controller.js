const { allowedAddressFields, allowedEmployeeRoles } = require('../constants/employeeFields');
const Employee = require('../models/employee.models')
const User = require("../models/user.models")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const createEmployee = async (req,res,next) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { name, email, phoneNum, role, password, department, designation, salary } = req.body;

        if(!allowedEmployeeRoles.includes(role)){
            await session.abortTransaction();
            return res.status(400).json({
                message:"Invalid employee role."
            })
        }
        //check email
        const existingEmail = await User.findOne({email}).session(session);
        if(existingEmail){
            return res.status(409).json({message: "User with this email already exists"})
        }

        //check phone number
        const existingPhone = await User.findOne({phoneNum}).session(session);
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
            role,
            isActive: true
        }],
        {session})

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

//  Get All the employees
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

// Get particular employee by ID
const getEmployeeById = async (req,res, next)=>{
    try {
        const employee = await Employee.findById(req.params.id)
        .populate("userId", "name email phoneNum role isActive")
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists"})
        }
        res.status(200).json({message:"Employee fetched successfully", employee})
    } catch (error) {
        next(error)
    }
}

// Get own profile
const getMyProfile = async(req,res,next) =>{
    try {
        const employee = await Employee.findOne({
            userId: req.user.userId
        }).populate(
            "userId",
            "name email phoneNum role isActive"
        );

        if(!employee){
            return res.status(404).json({
                message: "Employee profile not found"
            })
        }
        return res.status(200).json({message:"Profile fetched successfully", employee})
    } catch (error) {
        next(error);
    }
}

const updateEmployee = async(req,res,next)=>{
    try {
        const employee = await Employee.findById(req.param.id);
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists."})
        }

        if(req.user.role === "Employee" && employee.userId.toString() !== req.user.userId){
            return res.status(403).json({message: "You can only update your own profile."})
        }

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
        
        const updatedemployee = await Employee.findByIdAndUpdate(
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
        res.status(200).json({message:"Employee updated successfully", updatedemployee})
    } catch (error) {
        next(error)
    }
}

const deleteEmployee = async(req,res,next)=>{
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const employee = await Employee.findById
        (req.params.id)
        .session(session);

        if(!employee){
            await session.abortTransaction();
            return res.status(404).json({message: "Employee doesn't exists."})
        }

        await Employee.findByIdAndDelete(req.params.id,
        {session});
        await User.findByIdAndDelete(employee.userId,
            {session}
        );
        await session.commitTransaction()
        res.status(200).json({message:"Deleted successfully", employee})
    } catch (error) {
        await session.abortTransaction()
        next(error)
    } finally{
        await session.endSession();
    }
}

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    getMyProfile,
    updateEmployee,
    deleteEmployee
}