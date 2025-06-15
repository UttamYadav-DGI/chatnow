import dotenv from "dotenv";
dotenv.config({
    path:'./env'
}) 
import mongoose from "mongoose";
import { DB_NAME } from "../constraints.js"

const connectDB=async()=>{
    try{
        const connectionInstance = await mongoose.connect(`mongodb+srv://Uttam:12345@cluster0.s0erxwb.mongodb.net/${DB_NAME}`);
        console.log(`\n mongodb Connected host at ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("something went wrong while db not connected",error);
        process.exit(1);
    }
}
export  {connectDB};
