import {User} from "../Models/User.Models.js"
import { ApiError } from "../Utils/ApiErrors.js"
import {asyncHandler} from "../Utils/AsyncHandler.js"
import jwt, { decode } from "jsonwebtoken"
export const verifyJWT= asyncHandler(async(req,res,next)=>{

    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"unauthorized request");
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user=  await User.findById(decodedToken?._id).select("-password -refreshToken")
    
      if(!user){
        throw new ApiError(401,"invalid access token");
      }
      req.user=user; //req m send kr rhe h user
      next()
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token")
    }
})