const { allowedAddressFields, allowedEmployeeRoles, allowedHRUpdateFields, allowedEmployeeUpdateFields } = require('../constants/employeeFields');
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
            companyId: req.user.companyId,
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
        const users = await User.find({
            companyId: req.user.companyId
        }).select("_id");

        const userIds = users.map(user => user._id);
        const employees =  await Employee
        .find({userId: {$in: userIds}})
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
        .populate("userId", "name email phoneNum role isActive companyId")
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists"})
        }

        if(employee.userId.companyId.toString() !== req.user.companyId.toString()){
            return res.status(403).json({message:"You are not authorized to access this employee"})
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
        const employee = await Employee.findById(req.params.id);
        if(!employee){
            return res.status(404).json({message:"Employee doesn't exists."})
        }

        const user = await User.findById(employee.userId)
        if(!user){
            return res.status(404).json({message:"Associated user doesn't exist"})
        }

        if(user.companyId.toString() !== req.user.companyId.toString()){
            return res.status(403).json({message:"You are not authorized to update this employee"})
        }

        if(req.user.role === "Employee" && employee.userId.toString() !== req.user.userId){
            return res.status(403).json({message: "You can only update your own profile."})
        }

        const allowedFields = req.user.role === "HR"? allowedHRUpdateFields : allowedEmployeeUpdateFields
        const updates = {}
        for (const field of allowedFields){
            if(req.body[field] === undefined){
                continue;
            }

            if(field === "address"){
                for(const addressField of allowedAddressFields){
                    if(req.body.address?.[addressField] !== undefined){
                        updates[`address.${addressField}`] = req.body.address[addressField]
                    }
                }
            } else if (field === 'bankDetails'){
                updates.bankDetails = req.body.bankDetails
            } else {
                updates[field] = req.body[field]
            }
        }
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
        if(!updatedemployee){
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

        const user = await User.findById(employee.userId).session(session);
        if(!user){
            await session.abortTransaction();
            return res.status(404).json({message:"Associated user doesn't exist."})
        }

        if(user.companyId.toString() !== req.user.companyId.toString()){
            await session.abortTransaction()
            return res.status(403).json({message:"You are not authorized to delete this employee"})
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

const assignTeamLead = async (req, res, next) => {
    try {
        const { teamLeadId } = req.body

        // 1. Validate teamLeadId
        if (!teamLeadId) {
            return res.status(400).json({
                message: "Team lead ID is required."
            })
        }

        // 2. Find employee
        const employee = await Employee.findById(req.params.id)

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found."
            })
        }

        // 3. Find the selected TeamLead user
        const teamLead = await User.findById(teamLeadId)

        if (!teamLead) {
            return res.status(404).json({
                message: "Team lead not found."
            })
        }

        // 4. Make sure the selected user actually has TeamLead role
        if (teamLead.role !== "TeamLead") {
            return res.status(400).json({
                message: "Selected user does not have TeamLead role."
            })
        }

        // 5. Find the User associated with this employee
        const employeeUser = await User.findById(employee.userId)

        if (!employeeUser) {
            return res.status(404).json({
                message: "Employee user not found."
            })
        }

        // 6. Make sure employee and TeamLead belong to same company
        if (
            employeeUser.companyId.toString() !==
            teamLead.companyId.toString()
        ) {
            return res.status(403).json({
                message: "Employee and TeamLead must belong to the same company."
            })
        }

        // 7. Check if employee is already assigned to this TeamLead
        if (
            employee.teamLeadId &&
            employee.teamLeadId.toString() === teamLead._id.toString()
        ) {
            return res.status(409).json({
                message: "Employee is already assigned to this TeamLead."
            })
        }

        // 8. Assign TeamLead
        employee.teamLeadId = teamLead._id

        // 9. Save employee
        await employee.save()

        // 10. Return response
        return res.status(200).json({
            message: "TeamLead assigned successfully.",
            employee
        })

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    getMyProfile,
    updateEmployee,
    deleteEmployee,
    assignTeamLead
}