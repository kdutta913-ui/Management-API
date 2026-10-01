const mongoose = require("mongoose")
const { LEAVE_TYPES, LEAVE_STATUS } = require("../constants/leaveTypes")

const leaveSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },

        requestedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        leaveType:{
            type: String,
            required: true,
            enum: LEAVE_TYPES
        },

        startDate:{
            type: Date,
            required:true
        },

        endDate:{
            type: Date,
            required: true,
            validate:{
                validator: function(value){
                    return value >= this.startDate;
                },
                message: "End date must be greater than or equal to start date."
            }
        },

        reason:{
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            default: "PENDING",
            enum: LEAVE_STATUS
        },

        approvedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        approvedAt:{
            type: Date,
            default: null,
        },

        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        rejectedAt:{
            type: Date,
            default: null
        },

        rejectionReason:{
            type: String,
            default: null
        },

        cancelledAt:{
            type: Date,
            default: null
        }

},{timestamps:true})

module.exports = mongoose.model("Leave", leaveSchema)