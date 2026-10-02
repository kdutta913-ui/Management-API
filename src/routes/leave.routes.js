const express = require('express')
const router = express.Router()

const {requestLeave, getLeaves, getLeaveById, approveLeave, rejectLeave, cancelLeave} = require("../controllers/leave.controllers");

const authenticate = require("../middleware/authenticate.middleware")
const authorize = require("../middleware/authorize.middleware")


router.post("/",
    authenticate,
    authorize("HR","TeamLead","Employee"),
    requestLeave,
);

router.get("/",
    authenticate,
    authorize(
        "CompanyAdmin",
        "HR",
        "TeamLead",
        "Employee"
    ),
    getLeaves
)

router.get(
    "/:id",
    authenticate,
    authorize(
        "CompanyAdmin",
        "HR",
        "TeamLead",
        "Employee"
    ),
    getLeaveById
);

router.patch(
    "/:id/approve",
    authenticate,
    authorize(
        "CompanyAdmin",
        "HR"
    ),
    approveLeave
);

router.patch("/:id/reject",
    authenticate,
    authorize("CompanyAdmin","HR"),
    rejectLeave
)

router.patch("/:id/cancel",
    authenticate,
    authorize("HR", "TeamLead", "Employee"),
    cancelLeave
)

module.exports = router;