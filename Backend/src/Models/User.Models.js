import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv";
dotenv.config({
    path:'./env'
}) 
const userSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            unique:true,
            required:true,
        },
        fullname:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:[true || "password is required"],
            minlength:6,
        },
        avatar:{
            type:String,
            default:"",
        },
        refreshToken:{
            type:String
        },
        accessToken:{
            type:String
        }
    },
    {timestamps:true}
)

userSchema.pre("save", async function (next){ 
    if(!this.isModified("password")) return next();
     this.password= await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect=async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
  return  jwt.sign(
        {
        _id:this._id,
        email:this.email,
        fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
userSchema.methods.generateRefreshToken=function(){
  return   jwt.sign(
        {
        _id:this._id,
       
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
)
}


export const User = mongoose.model("User",userSchema);