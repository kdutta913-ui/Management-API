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

const allowedHRUpdateFields = [
    "department",
    "designation",
    "salary",
    "dateOfJoining",
    "address",
    "bankDetails"
];

const allowedEmployeeUpdateFields = [
    "address",
    "bankDetails"
];

module.exports = {
    allowedFields,
    allowedAddressFields,
    allowedEmployeeRoles,
    allowedHRUpdateFields,
    allowedEmployeeUpdateFields
}