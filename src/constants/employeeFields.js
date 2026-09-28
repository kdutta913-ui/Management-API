const allowedFields = [
    "name",
    "email",
    "phoneNum",
    "password",
    "department",
    "designation",
    "salary"
]

const allowedAddressFields = [
    "street",
    "city",
    "state",
    "pincode"
]

const allowedEmployeeRoles = [
    "HR",
    "TeamLead",
    "Employee"
]

module.exports = {
    allowedFields,
    allowedAddressFields,
    allowedEmployeeRoles
}