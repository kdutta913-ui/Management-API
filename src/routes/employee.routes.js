const express = require('express');
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employee.controller');
const router = express.Router();

router.post("/", createEmployee) //create employee
router.get("/", getEmployees) //get all the employees
router.get("/:id", getEmployeeById) // get the employee by id
router.patch("/:id", updateEmployee) // update something of the employee by id
router.delete("/:id", deleteEmployee) // delete the employee 

module.exports = router;