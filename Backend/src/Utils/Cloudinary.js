import {v2} from 'cloudinary'
import cloudinary from 'cloudinary'
import fs from 'fs'
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

const uploadonCloudinary=async(localFilePath)=>{
   try {
     if(!localFilePath) return null;
     const response=await cloudinary.uploader.upload(localFilePath,{
         resource_type:"auto"
     })
 
     //file has been uploaded successfully
     console.log("file is uploaded successfully on cloudinary",response.url);
     fs.unlinkSync(localFilePath);
     return response;
   } catch (error) {
        console.log("something went wrong in cloudinary operation");
        fs.unlinkSync(localFilePath);//remove the locally saved temporary file
   }
}

export {uploadonCloudinary};