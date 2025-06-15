import { app } from '../app.js';
import mongoose from 'mongoose'
import { User } from '../Models/User.Models.js'
import {ApiError} from '../Utils/ApiErrors.js'
import {ApiResponse} from '../Utils/ApiResponse.js'
import { uploadonCloudinary } from '../Utils/Cloudinary.js'
import {v2 as cloudinary} from 'cloudinary'
import jwt from 'jsonwebtoken'
import {asyncHandler} from '../Utils/AsyncHandler.js'
import {upload} from "../Middlewares/Multer.Middlewares.js"

const generateAccessAndRefreshToken=async(userId)=>{
    try {
       const user=await User.findById(userId);
        console.log("user",user);
        const refreshToken= user.generateRefreshToken()
        const accessToken=  user.generateAccessToken()

        user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false}) //it;s not neccessary to validate beacuse it's may affect our models collections

        return {accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and accessToken")
    }

}

const registerUser=asyncHandler(async(req,res)=>{
// we create a register 
// through username,email,password
// validate all field and check email is not exist already
// bcrypt password
//upload avatar photo on cloudinary
// add bio
// remove password &refreshtoken field from response
// return res
    const {fullname,email,password}=req.body
    console.log("reqbody is ",req.body)


    //validation
    if(
        [fullname,email,password].some((field)=>field?.trim()==="")
    )
    {
        throw new ApiError(400,"all field are required")
    }

    const existedUser=await User.findOne({email})
    if(existedUser){
        throw new ApiError(409,"email already exists");
    }
let avatarLocalPath=req.file?.path
let avatarUrl = null;
if (avatarLocalPath) {
  let avatar = await uploadonCloudinary(avatarLocalPath);
  avatarUrl = avatar.url;
}

const user = await User.create({
  fullname,
  email,
  password,
  avatar: avatarUrl
});
    //fetching the newly created user but withour sensenitive info password

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,createdUser,"user register successfully"))
})

    const loginUser=asyncHandler(async(req,res)=>{
            //req.body->data
            //validate all filed
            //check email & password is match with database password
            //authorized
            // accessToken & refreshToken ko generate krege
            //send cookie (access &refresh token ko cookie m send krege)
            const {email,password} = req.body

            if(!email){
                throw new ApiError(404,"email are required to login")
            }

            const user=await User.findOne({email})

            if(!user){
                throw new ApiError(404,"user not found");
            }
            const isPasswordValid= await user.isPasswordCorrect(password);
            if(!isPasswordValid){
                throw new ApiError(400,"invalid credentials access");
            }
            console.log("user id",user._id)
        const {accessToken,refreshToken} =   await generateAccessAndRefreshToken(user._id);
        
        //send cookies
      const logggedInUser= await User.findById(user._id).select("-password -refreshToken")

        const options={
            httpOnly:true,
            secure:true
        }
       

        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(
                    new ApiResponse(
                        200,
                       { user:logggedInUser,accessToken,refreshToken},
                       "user logged in successfully")
                )

    })  
    const logoutUser=asyncHandler(async(req,res)=>{
        // cookies ko clear/reset kr dege
        // remove refresh and accesstoken 
       User.findByIdAndUpadate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logout successfully"))
    })

const updateProfile=asyncHandler(async(req,res)=>{

        const {fullname,email,dpPic}=req.body;

        let avatarUrl;

        //if we want to change files realted data then we make a seprately
        if(dpPic){
            const avatar=await cloudinary.uploader.upload(dpPic)
            avatarUrl=avatar.secure_url;
        }

        const updateFields={
            ...(fullname && {fullname}),
            ...(email && {email}),
            ...(avatarUrl && {avatar:avatarUrl})

        }

        const user=await User.findByIdAndUpdate(
            req.user?._id,// find the id
            { $set:updateFields},
            { new:true},
        )
    return res
    .status(200)
    .json(new ApiResponse(200,user,"update successfully"));
})

const getUserProfile=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id);
    
    return res
            .status(200)
            .json(new ApiResponse(200,user,"user profile fetched successfully"))
}
)

const searchUser=asyncHandler(async(req,res)=>{

    const {name}=req.query.search?{// ?name=dfd &wow=a
        $or:[
            {name:{$regex:req.query.search,$options:"i"}},
            {email:{$regex:req.query.search,$options:"i"}}
        ],
    }
    :{};
    const users=await User.find(name).find({_id:{$ne:req.user._id}});
});

export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    getUserProfile,
    searchUser
    };

   