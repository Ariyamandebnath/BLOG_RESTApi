import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import {uploadOnClodinary} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    try{
        // Get user details from the frontend
        const { username, email, password } = req.body;

        // Validation - not empty
        if (
            [username, email, password].some((field) => field?.trim() === "")
            ) {
            throw new ApiError(400, "All fields are compulsory");
        }

        // Check if user already exists: username, email
        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        
        if (existedUser) {
            throw new ApiError(409, "User with email or username already exists");
        }

        // Upload profile picture to temporary storage
        const profilePictureLocalPath = req.files?.profilePicture[0]?.path;

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
        }).maxTimeMS(20000);

        // Save user to the database
        const savedUser= await newUser.save();

        // Remove password and reference token field from response
        const createdUser = await User.findById(savedUser._id).select("-password -refreshToken");

        // Check if the user is created successfully
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong when registering User");
        }

        // Return success response to the client
        return res.status(201).json(new ApiResponse(200, createdUser, "User created successfully"));
    } catch (error) {
        console.error('Error during user registration:', error);
        // Return error response to the client
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
});

export { registerUser };
