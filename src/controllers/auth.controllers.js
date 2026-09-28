const bcrypt = require("bcrypt");
const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Employee = require("../models/employee.models");

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const register = async (req, res, next) => {
  const { name, email, phoneNum, password } = req.body;
  if (!name || !email || !phoneNum || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNum }],
    }).session(session);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await User.create(
      [
        {
          name,
          email,
          phoneNum,
          password: hashedPassword,
          role: "CompanyAdmin",
        },
      ],
      { session },
    );

    const [employee] = await Employee.create(
      [
        {
          userId: user._id,
        },
      ],
      { session },
    );
    await session.commitTransaction();
    return res.status(201).json({
      message: "Company Admin registered successfully",
      userId: user._id,
      employeeId: employee._id,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

//login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and passoword are required" });
    }

    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: "User is not active" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
