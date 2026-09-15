const validateEmployeeUpdate = (req,res,next) =>{
    const allowedFields = ["name", "email", "phoneNum", "department", "designation", "salary", "address"]
    const allowedAddressFields = ["street", 'city', 'state', 'pincode']
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneNumRegex = /^[6-9]\d{9}$/  
    
    const invalidAddressFields = Object
    .keys(req.body.address || {})
    .find(field => !allowedAddressFields
        .includes(field))
    if(invalidAddressFields){
        return res.status(400).json({message:`Invalid address field: ${invalidAddressFields}`})
    }
    const invalidFields = Object.keys(req.body).find(field => !allowedFields.includes(field))
    
    if(invalidFields){
        return res.status(400).json({message: `Invalid field: ${invalidFields}`})
    }

    //Name validation
    if (req.body.name !== undefined) {
        if(req.body.name === null || typeof req.body.name !== 'string'){
            return res.status(400).json({message:"Invalid name"})
        }
        const value = req.body.name.trim()
        if(value === ""){
            return res.status(400).json({message:"Name can't be empty"})
        }
        req.body.name = value
        }

    //Email validation
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
        req.body.email = value
    }
    
    //Phone validation
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
            req.body.phoneNum = phoneNum
        }
        else{
            return res.status(400).json({message:"Invalid phone number"})
        }
    }

    //Salary validation
    if(req.body.salary !== undefined){
        if(req.body.salary === null || typeof req.body.salary === 'boolean'){
            return res.status(400).json({message:'Invalid salary'})
        }
        if(typeof req.body.salary === 'string'){
            const value = req.body.salary.trim()
            if(value === ""){
                return res.status(400).json({message:"Salary souldn't be empty."})
            }
            req.body.salary = Number(value);
        }
        else if(typeof req.body.salary === 'number'){    
            req.body.salary = Number(req.body.salary)
        }
        else{
            return res.status(400).json({message:"Invalid salary"})
        }
            
        if(!Number.isFinite(req.body.salary)){
            return res.status(400).json({message:"Enter valid salary"})
        }

        if(req.body.salary < 0){
            return res.status(400).json({message:"Salary can't be negative"})
        }
    }
    next()
}

module.exports = validateEmployeeUpdate