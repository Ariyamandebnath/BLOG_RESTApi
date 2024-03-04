import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import {uploadOnClodinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../middlewares/auth.middleware.js";


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
         //if user doesnot exist then check

         //check password length
         if(password){
            if(password.length<6){
                throw new ApiError(400,"Password must be at least 6 characters");
            }
         }
         //check username
         if(username){
            if(username.length<=7 || username.length>=20){
                throw new ApiError(400,"Username must be at least 7 characters and maximum 20 charactrs")
            }
            if(username!==username.toLowerCase()){
                throw new ApiError(400,"Username must be lowercase")

            }
            if(username.match(/^[a-zA-Z0-9]+$/)){
                throw new ApiError(400,"Username can contain letters and numbers only")
            }
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
        throw new ApiError(400,"username and email are required");

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

    //Get refresh token and access token

    const {accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)


    //login the User

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



const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
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

const changeCurrentPassword =asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}= req.body
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect =await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old Password")
    }

    user.password = newPassword
    await user.save({
        validateBeforeSave: false
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})


const getCurrentUser =asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

const updateUserDetails = asyncHandler(async(req,res)=>{
    const {username, email}= req.body

    if(!username||!email){
        throw new ApiError(400,"All fields are required")
    }

    const user =User.findByIdAndUpdate(    
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }

        },
        {new: true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))

}
)


const updateprofilePicture =asyncHandler(async(req, res)=>{
    const profilePictureLocalPath =req.file?.path

    if(!profilePictureLocalPath){
        throw new ApiError(400, "Profile picture is missing")
    }

    const profilePicture = await uploadOnClodinary(profilePictureLocalPath)

    if(!profilePicture.url){
        throw new ApiError(400, "Error while uploading profile picture")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                profilePicture:profilePicture.url
            }
        },
        {
            new:true
        }
    ).select("-password")
})


const getAuthorProfile = asyncHandler( async(req,res)=>{
    const {username} =req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const author =await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"Subscription",
                localField: "_id",
                foreignField: "Author",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from:"Subscription",
                localField: "_id",
                foreignField: "subcriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                AuthorSubscribedToCount:{
                    size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                subscribersCount:1,
                AuthorSubscribedToCount:1,
                profilePicture:1,
                email:1,
            
            }
        }
    ])
    if(!author?.length){
        throw new ApiError(404,"Author does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
    )
})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateprofilePicture,
    updateUserDetails,
    getAuthorProfile


};
