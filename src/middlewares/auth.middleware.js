import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js"
export const verifyJWT = asyncHandler(async (req, res, next)=>{
    const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401, "Unauthorized request")
        }

    const decodedAccessToken=jwt.verify(token , ACCESS_TOKEN_SECRET)

    const user =await User.findById(decodedAccessToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid access Token")
    }
    req.user = user;
    next()

})