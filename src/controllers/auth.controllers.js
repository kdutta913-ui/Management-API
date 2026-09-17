const bcrypt = require('bcrypt')
const User = require("../models/user.models")

const register = async(req, res, next) =>{
    try {
        const {name, email, phoneNum, password} = req.body;
        if(!name || !email || !phoneNum || !password){
            return res.status(400).json({message:"All fields are required"})
        };
        const existingUser = await User.findOne({
            $or: [
                {email},
                {phoneNum}
            ]
        });
        if(existingUser){
            return res.status(409).json({message:"User already exists"})
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            phoneNum,
            password: hashedPassword,
            role: "CompanyAdmin"
        });
        return res.status(201).json({
            message:"User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNum: user.phoneNum,
                role: user.role
            }
        })
    } catch (error) {
        next(error)
    };
};