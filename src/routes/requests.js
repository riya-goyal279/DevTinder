const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestsRouter = express.Router();

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res) => {
    try {
        const fromUserId = req.user._id;
        const {status, toUserId} = req.params;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status))
            return res.status(400).json({message: "Invalid status type " + status});

        const toUser = await User.findById(toUserId);
        if(!toUser) 
            return res.status(404).json({message: "Request user not found!"});

        const isConnectionRequestExist = await ConnectionRequest.findOne({
            $or: [
                {fromUserId,toUserId},
                {fromUserId: toUserId,toUserId: fromUserId}
            ]
        });
        if(isConnectionRequestExist)
            return res.status(400).json({message: "Connection request already exists!!"});
        
        const request = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });

        const data = await request.save();
        res.json({
            message: status === "interested" ? "Connection Request sent Successfully!!!" : "User Ignored Succesfully!!!",
            data,
        })

    } catch(err) {
        res.status(400).send("Error: " + err.message);
    }
});

requestsRouter.post("/request/send/:status/:requestId", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const {status, requestId} = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status))
            res.status(404).json({message: `${status} status is not valid!!!`});

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });
        if(!connectionRequest)
            res.status(404).json({message: `Connection request not found!!!`});

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({
            message: `Connection request is ${status}!!!`, 
            data,
        });

    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = requestsRouter;