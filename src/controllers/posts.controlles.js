import { uploadOnClodinary } from "../utils/cloudinary";
import Post from "../models/post.models"
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiErrors.js";

const createPosts = asyncHandler(async (req,res,next)=>{

if(!req.user.isAdmin){
    throw new ApiError("You are not alloed to create a new post")
}
})