import dotenv from "dotenv"

dotenv.config();

if(!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");

if(!process.env.PORT) throw new Error("PORT is not defined");

if(!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

const config={
    MONGO_URI:process.env.MONGO_URI,
    PORT:process.env.PORT,
    JWT_SECRET:process.env.JWT_SECRET
}

export default config;