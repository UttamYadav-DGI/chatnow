import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const port= process.env.PORT || 5000;
const app=express();

// const corsOptions={
//     origin:"http://localhost:5173",
//     method:"GET,POST,PUT,DELETE,PATCH,HEAD",
//     credentials:true //The credentials: true option in CORS (Cross-Origin Resource Sharing) allows the server to accept cookies, authorization headers, or TLS client certificates from cross-origin requests.
// }
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser());// user ki cookies ko access krna or set user cookies 


//routes
import userRouter from './Routes/User.Routes.js'
import ChatRouter from './Routes/Chat.Routes.js'
import MessageRouter from './Routes/Message.Routes.js'
//route declarations

app.use("/api/v1/users",userRouter);
app.use("/api/v1/Chat",ChatRouter);
app.use("/api/v1/Message",MessageRouter)
//https:://localhost/users/register

app.listen(process.env.PORT || 5000,()=>{
    console.log(`serve at http://localhost:${port}`);
})
export  {app};