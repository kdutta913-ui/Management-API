const express = require("express");
const employeeRoute = require("./employee.routes")

const router = express.Router();

router.use("/api/employees", employeeRoute)

module.exports = router;