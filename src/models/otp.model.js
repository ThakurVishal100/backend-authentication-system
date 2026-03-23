import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    
    otpHash: {
        type: String,
        required: [true, "OTP Hash is required"],
    },
    //  //   TTL Index for automatic cleanup
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Document will be automatically deleted 300 seconds (5 mins) after creation
    },
    //  MongoDB's TTL monitor runs every 60 seconds in the background
    
},{
    timestamps: true
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;