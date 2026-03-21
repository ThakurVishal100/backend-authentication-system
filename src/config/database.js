import mongoose, { connect } from "mongoose";
import config from "./config.js";

const uri=config.MONGO_URI;

async function connectDb(){
    try {
        await mongoose.connect(uri);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Error connecting database",error);   
    }
}

export default connectDb;