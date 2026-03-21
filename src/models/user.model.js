import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    userName:{
        type:String,
        required:[true,"User name is required"],
        unique:[true,"User name must be unique"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email must be unique"]
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    }

},{
    timestamps:true
})

const User =mongoose.model("User",userSchema);
// "User" → collection name (MongoDB will convert it to users)
// userSchema → structure you defined
// User → used to interact with DB

export default User;