const Leave = require('../models/leave.models')
const User = require("../models/user.models")

const {LEAVE_TYPES} = require("../constants/leaveTypes")

//REQUEST LEAVES
const requestLeave = async(req,res,next) =>{
    try {
        
        const{leaveType, startDate, endDate, reason} = req.body;

        if(req.user.role === "CompanyAdmin"){
            return res.status(403).json({message:"Company Admin can't request leave"})
        }

        if(!LEAVE_TYPES.includes(leaveType)){
            return res.status(400).json({message:"Invalid leave type"})
        }

        if(!startDate || !endDate || !reason ){
            return res.status(400).json({message:"Leave type, start date, end date and reason are required."})
        }

        const start = new Date(startDate);
        const end = new Date(endDate)

        if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())){
            return res.status(400).json({message:"Invalid date format"})
        }

        if(startDate > endDate){
            return res.status(400).json({message:"Start date can't be after end date."})
        }

        const user = await User.findOne({
            _id: req.user.userId,
            companyId: req.user.companyId
        });

        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const overlappingLeave = await Leave.findOne({
            companyId: req.user.companyId,
            requestedBy: req.user.userId,
            status:{
                $in: ["PENDING", "APPROVED"]
            },
            startDate:{
                $lte: end
            },

            endDate:{
                $gte: start
            }
        });

        if(overlappingLeave){
            return res.status(409).json({message:"You already have a pending or approved leave that overlaps with these dates."})
        }

        const leave = await Leave.create({
            companyId: req.user.companyId,
            requestedBy: req.user.userId,
            leaveType,
            startDate: start,
            endDate: end,
            reason
        })

        return res.status(201).json({message:"Leave requested successfully.", leave})
    } catch (error) {
        console.log("REQUESTED LEAVE ERROR:", error)
        next(error)
    }
}

//GET LEAVES
const getLeaves = async(req,res,next) =>{
    try {
        let query = {
            companyId: req.user.companyId
        };

        if(req.user.role === "TeamLead" || req.user.role === "Employee"){
            query.requestedBy = req.user.userId;
        }

        const leaves = await Leave.find(query)
        .populate("requestedBy",
            "name email phoneNum role"
        )
        .populate("approvedBy", "name email role")
        .populate("rejectedBy","name email role")
        .sort({createdAt: -1});

        return res.status(200).json({message:"Leaves fetched successfully", count:leaves.length, leaves})
    } catch (error) {
        next(error)
    }
};

const getLeaveById = async(req, res, next)=>{
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        })
        .populate("requestedBy", "name email phoneNum role")
        .populate("approvedBy", "name email role")
        .populate("rejectedBy", "name email role")

        if(!leave){
            return res.status(404).json({message:"Leave not found"})
        }

        if((req.user.role === "TeamLead" || req.user.role==="Employee") &&
    leave.requestedBy._id.toString() !== req.user.userId.toString()){
        return res.status(403).json({message:"You are not authorized to view this leave"})
    }
    return res.status(200).json({message:"Leave fetched successfully.", leave})
    } catch (error) {
        next(error)
    }
};

const approveLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!leave) {
            return res.status(404).json({
                message: "Leave not found."
            });
        }

        // ----------------------------------------------------
        // Only pending leaves can be approved
        // ----------------------------------------------------

        if (leave.status !== "PENDING") {

            return res.status(400).json({
                message:
                    `Leave cannot be approved because its current status is ${leave.status}.`
            });
        }

        // ----------------------------------------------------
        // HR cannot approve their own leave
        // ----------------------------------------------------

        if (
            req.user.role === "HR" &&
            leave.requestedBy.toString() ===
            req.user.userId.toString()
        ) {

            return res.status(403).json({
                message:
                    "HR cannot approve their own leave."
            });
        }

        // ----------------------------------------------------
        // Approve
        // ----------------------------------------------------

        leave.status = "APPROVED";

        leave.approvedBy = req.user.userId;

        leave.approvedAt = new Date();

        await leave.save();

        return res.status(200).json({
            message: "Leave approved successfully.",
            leave
        });
    } catch (error) {
        next(error);
    }
};

const rejectLeave = async(req,res,next)=>{
    try {
        const { rejectionReason } = req.body

        const leaves = await Leave.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        }) 

        if(!leaves){
            return res.status(404).json({message:"Leave not found"})
        }

        if(leaves.status !== "PENDING"){
            return res.status(400).json({message:`Leave can't be rejected because it's current state is ${leaves.status}`})
        }

        if(req.user.role === "HR" && leave.requestedBy.toString() ===
        req.user.userId.toString()) {
            return res.status(403).json({message:"HR can't reject there own leave"})
        }

        if(!rejectionReason || rejectionReason === "" || rejectionReason === " "){
            return res.status(400).json({message:"Rejection reason can't be empty"})
        }

        leaves.status = "REJECTED";
        leaves.rejectedBy = req.user.userId;
        leaves.rejectedAt = new Date();
        leaves.rejectionReason = rejectionReason

        await leaves.save()
        return res.status(200).json({message:"Leave rejected successfully", leaves})
    } catch (error) {
        next(error)
    }
};

const cancelLeave = async(req,res,next)=>{
    try {
        const leaves = await Leave.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        })

        if(!leaves){
            return res.status(404).json({message:"Leaves not found"})
        }

        if(leaves.status !== "PENDING"){
            return res.status(400).json({message:`Leave can't be cancelled because it's current state is ${leaves.status}`})
        }

        leaves.status = "CANCELLED"
        leaves.cancelledAt = new Date()

        await leaves.save()
        return res.status(200).json({message:"Leaves cancelled successfully"})
    } catch (error) {
        next(error)
    }
}


module.exports = {
    requestLeave,
    getLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave,
    cancelLeave
}