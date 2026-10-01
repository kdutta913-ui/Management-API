const express = require("express");
const employeeRoute = require("./employee.routes")
const authRoute = require("./auth.routes")
const leaveRoutes = require("./leave.routes")

const router = express.Router();

router.use("/api/auth", authRoute)
router.use("/api/employees", employeeRoute)
router.use("api/leaves", leaveRoutes)


module.exports = router;