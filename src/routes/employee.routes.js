const express = require('express');
const { createEmployee } = require('../controllers/employee.controller');
const router = express.Router();

router.post("/", createEmployee) //create employee

router.get("/", (req,res)=>{}) //get all the employees
router.get("/:id", (req,res)=>{}) // get the employee by id
router.patch("/:id", (req,res)=>{}) // update something of the employee by id
router.delete("/:id", (req,res)=>{}) // delete the employee 

module.exports = router;