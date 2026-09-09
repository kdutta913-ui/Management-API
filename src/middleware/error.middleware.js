const errorHandler = (err, req, res, next)=>{
    if(err.name === 'ValidationError'){
        const validationErrors ={}
        Object.keys(err.errors).forEach((field)=>{
            validationErrors[field] = err.errors[field].message
        })
        return res.status(400).json({message:"Validation failed", errors:validationErrors})
    }
    
    if(err.name === 'CastError'){
        if(err.path === '_id'){
            return res.status(400).json({message:"Invalid Employee ID."})
        }
        else{
            return res.status(400).json({message:`Invalid value for field: ${err.path}` })
        }
    }

    if(err.code === 11000){
        if(err.keyPattern.email){
            return res.status(409).json({message:"Email already exists."})
        }
        if(err.keyPattern.phoneNum){
            return res.status(409).json({message:"Phone number already exists."})
        }
    }
    return res.status(500).json({message:"Server error"})
}

module.exports = errorHandler
