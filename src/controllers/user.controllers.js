import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import {uploadOnClodinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { response } from "express";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
       const user= await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})

       return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
        
    }
}

const registerUser = asyncHandler(async (req, res) => {
    try{
         // Get user details from the frontend
         const { username, email, password } = req.body;

         // Validation - not empty
         if (![username, email, password].every((field) => field && field.trim() !== "")) {
             throw new ApiError(400, "All fields are compulsory");
         }
 
         // Check if user already exists: username, email
         const existingUser = await User.findOne({ $or: [{ username }, { email }] });
         if (existingUser) {
             throw new ApiError(409, "User with email or username already exists");
         }
 
         // Upload profile picture to temporary storage
         const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;
 
         // Check if profile picture is uploaded to temporary storage successfully
         if (!profilePictureLocalPath) {
             throw new ApiError(400, "Profile Picture is required");
         }
 
         // Upload profile picture from local storage to Cloudinary
         const profilePicture = await uploadOnClodinary(profilePictureLocalPath);
 
         if (!profilePicture) {
             throw new ApiError(400, "Error uploading Profile Picture to Cloudinary");
         }
 
         // Create user object - create entry in DB
         const newUser = new User({
             username: username.toLowerCase(),
             email,
             password,
             profilePicture: profilePicture?.url || "",
         });
 
         // Save user to the database
         const savedUser = await newUser.save();
 
         // Remove sensitive fields from the response
         const responseUser = savedUser.toObject();
         delete responseUser.password;
         delete responseUser.refreshTokens;
 
         // Return success response to the client
         return res.status(201).json(new ApiResponse(200, responseUser, "User created successfully"));

    } catch (error) {
        
        console.error('Error during user registration:', error);
        // Return error response to the client
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
});


const loginUser =asyncHandler(async (req,res)=>{
   
    //req.body --> data
    const {email,username, password} = req.body;
    //username or email
    if(!email && !username){
        throw new ApiError(400,"username or email is required");

    }
    //find the user

    const user = await User.findOne({
        $or:[{username}, {email}]
    });
    
    if (!user){
        throw new ApiError(400,"User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401,"Invalid User Credentials");
    }

    //Got refresh token and access token

    const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)


    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(

        new ApiResponse(

            200,
            {
                user:loggedinUser, accessToken, refreshToken
            },
            "user logged In successfully"

        )
       
    )

})

const logoutUser = asyncHandler(async(req, res)=>{
    
    
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken)
    {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFERESH_TOKEN_SECRET,
    
        )
        const user = User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
    
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken, refreshToken,
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invalid access token")
        
    }

})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken


};
