const express = require('express');
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee, getMyProfile } = require('../controllers/employee.controller');
const { validateEmployeeFields, validateName, validateEmail, validatePhone, validateSalary, validateEmployeeCreate, validatePassword } = require('../middleware/employee.validation');

const authenticate = require('../middleware/authenticate.middleware')
const authorize = require("../middleware/authorize.middleware")

const router = express.Router();

router.post("/", 
    authenticate, 
    authorize("CompanyAdmin", "HR"), 
    validateEmployeeCreate,
    validateEmployeeFields,
    validateName,
    validateEmail,
    validatePhone,
    validatePassword,
    validateSalary, 
    createEmployee) //create employee

router.get("/",
    authenticate, 
    authorize("CompanyAdmin", "HR", "TeamLead"),
    getEmployees) //get all the employees

// Get my profile
router.get("/me",
    authenticate,
    getMyProfile
);

router.get("/:id",
    authenticate, 
    authorize("HR", "TeamLead"), 
    getEmployeeById) // get the employee by id

router.patch("/:id",
    authenticate, 
    authorize("HR", "Employee"),
    validateEmployeeFields, 
    validateName, 
    validateEmail, 
    validatePhone, 
    validateSalary, 
    updateEmployee) // update something of the employee by id

router.delete("/:id",
    authenticate, 
    authorize("HR", "CompanyAdmin"), 
    deleteEmployee) // delete the employee 

module.exports = router;