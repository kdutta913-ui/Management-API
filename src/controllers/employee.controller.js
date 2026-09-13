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
        const allowedAddressFields = ["street", 'city', 'state', 'pincode']
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phoneNumRegex = /^[6-9]\d{9}$/
        //Email validation
        if(req.body.email !== undefined){
            if(req.body.email === null || typeof req.body.email !== "string" || req.body.email === ""){
                return res.status(400).json({message: "Email should be valid"})
            }

            if(!emailRegex.test(req.body.email)){
                return res.status(400).json({message:"Invalid email address"})
            }
        }
        //Phone validation
        if(req.body.phoneNum !== undefined){
            if(req.body.phoneNum === null || typeof req.body.phoneNum === 'boolean'){
                return res.status(400).json({message:"Invalid phone number"})
            }
            if(typeof req.body.phoneNum === "string" || typeof req.body.phoneNum === "number"){
                const phoneNum = String(req.body.phoneNum)
                if(!phoneNumRegex.test(phoneNum)){
                    return res.status(400).json({message:"Invalid phone number"})
                }
            else{
                return res.status(400).json({message:"Enter valid phone number"})
            }
            }
        }
        //Salary validation
        let sal;
        if(req.body.salary !== undefined){
            if(req.body.salary === null || typeof req.body.salary === 'boolean' || req.body.salary === ""){
                return res.status(400).json({message:'Invalid salary'})
            }
            if(typeof req.body.salary === 'string' || typeof req.body.salary === 'number'){
                sal = Number(req.body.salary)
                if(Number.isNaN(sal)){
                    return res.status(400).json({message:"Enter valid salary"})
                }
                if(sal < 0){
                    return res.status(400).json({message:"Salary can't be negative."})
                }
            else{
                return res.status(400).json({message:"Invalid salary"})
            }
            }
        }
        
        const updates = {}
        const invalidAddressFields = Object.keys(req.body.address || {}).find(field => !allowedAddressFields.includes(field))

        if(invalidAddressFields){
            return res.status(400).json({message:`Invalid address field: ${invalidAddressFields}`})
        }
        
        const invalidFields = Object.keys(req.body).find(field => !allowedFields.includes(field))

        if(invalidFields){
            return res.status(400).json({message: `Invalid field: ${invalidFields}`})
        }

        allowedFields.forEach((field) =>{
            if(field === "address"){
                allowedAddressFields.forEach((addressField)=>{
                    if(req.body[field]?.[addressField] !== undefined){
                        updates[`${field}.${addressField}`] = req.body[field][addressField]
                    }
                })

            }else if(field === "salary"){
                if(sal !== undefined){
                    updates[field] = sal
                }
            }

            else{
                if(req.body[field] !== undefined){
                    updates[field] = req.body[field]
                    }
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
};