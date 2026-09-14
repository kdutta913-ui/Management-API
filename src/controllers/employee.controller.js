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
        let newEmail;
        if(req.body.email !== undefined){
            if(req.body.email === null || typeof req.body.email !== "string"){
                return res.status(400).json({message: "Email should be valid"})
            }
            const value = req.body.email.trim()
            if(value === ""){
                return res.status(400).json({message:"Invalid email"})
            }
            if(!emailRegex.test(value)){
                return res.status(400).json({message:"Invalid email address"})
            }
            newEmail = value
        }
        //Phone validation
        let newPhoneNum;
        if(req.body.phoneNum !== undefined){
            if(req.body.phoneNum === null || typeof req.body.phoneNum === 'boolean'){
                return res.status(400).json({message:"Invalid phone number"})
            }
            if(typeof req.body.phoneNum === "string" || typeof req.body.phoneNum === "number"){
                const phoneNum = String(req.body.phoneNum).trim()
                if(phoneNum === ""){
                    return res.status(400).json({message:"Invalid phone number"})
                }
                if(!phoneNumRegex.test(phoneNum)){
                    return res.status(400).json({message:"Invalid phone number"})
                }
                newPhoneNum = phoneNum
            }
            else{
                return res.status(400).json({message:"Invalid phone number"})
            }
        }
        //Salary validation
        let sal;
        if(req.body.salary !== undefined){
            if(req.body.salary === null || typeof req.body.salary === 'boolean'){
                return res.status(400).json({message:'Invalid salary'})
            }
            if(typeof req.body.salary === 'string'){
                const value = req.body.salary.trim()
                if(value === ""){
                    return res.status(400).json({message:"Salary souldn't be empty."})
                }
            sal = Number(value);
            }
            else if(typeof req.body.salary === 'number'){    
                sal = Number(req.body.salary)
            }
            else{
                return res.status(400).json({message:"Invalid salary"})
            }
            
            if(Number.isFinite(sal)){
                return res.status(400).json({message:"Enter valid salary"})
            }

            if(sal < 0){
                return res.status(400).json({message:"Salary can't be negative"})
            }
        }
        
        //Name Validation
        let newName;
        if (req.body.name !== undefined) {
            if(req.body.name === null || typeof req.body.name !== 'string'){
                return res.status(400).json({message:"Invalid name"})
            }
            const value = req.body.name.trim()
            if(value === ""){
                return res.status(400).json({message:"Name can't be empty"})
            }
            newName = value
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

            else if(field === "name"){
                if(newName !== undefined){
                    updates[field] = newName
                }
            }

            else if(field === "email"){
                if(newEmail !== undefined){
                    updates[field] = newEmail
                }
            }

            else if(field === 'phoneNum'){
                if(newPhoneNum !== undefined){
                    updates[field] = newPhoneNum
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
}