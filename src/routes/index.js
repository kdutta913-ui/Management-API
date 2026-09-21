const express = require("express");
const employeeRoute = require("./employee.routes")
const authRoute = require("./auth.routes")

const router = express.Router();

router.use("/api/auth", authRoute)
router.use("/api/employees", employeeRoute)


module.exports = router;