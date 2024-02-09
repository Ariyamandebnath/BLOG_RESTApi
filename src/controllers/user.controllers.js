import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import {uploadOnClodinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{

  


    //get user detail from the frontend

    const { username, email, password} = req.body

    
    //validation -not empty

    if(
        [username, email, password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are compolsory")
    }

    //check if user already exits: username, email
    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    //upload profilePicture to temporary storage

    const profilePictureLocalpath=req.files?.profilePicture[0]?.path;

    //check if profilePicture is uploaded to temporary storage sucessfully
    if(!profilePictureLocalpath){
        throw new ApiError(400, "Profile Picture  is required")

    }


    // upload profile picture from local storage to cloudinary 
    const profilePicture =await uploadOnClodinary(profilePictureLocalpath)

    if (!profilePicture){
        throw new ApiError(400, "Profile Picture is required")
    }


    //create user object - create entry in db

    const newUser = new User({
        username: username.toLowerCase(),
        email,
        password,
        profilePicture: profilePicture?.url || ""
    });
    
    try {
        await newUser.save();
        console.log('User created successfully:', newUser);
    } catch (error) {
        console.error('Error creating user:', error.message);
    }

    //remove password and reference token field from response

    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //check if the user is created successfully

    if(!createdUser){
        throw new ApiError(500,"Something went wrong when registering User")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )





})

export { registerUser };