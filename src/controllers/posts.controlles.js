import { uploadOnClodinary } from "../utils/cloudinary";
import Post from "../models/post.models"
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiErrors.js";

const createPosts = asyncHandler(async (req,res,next)=>{

if(!req.user.isAdmin){
    throw new ApiError("You are not alloed to create a new post")
}
if(!req.body.title|| !req.body.content){
    throw new ApiError(400,"Please provide all required fields")
}

const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

const newPost = new Post({
    ...req.body,
    slug,
    Author:req.user.id,
});
const savedPost = await newPost.save()
res.status(201).json(savedPost)
})


const getPosts = asyncHandler(async (req, res, next) => {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortingDirection = req.query.order === "asc" ? 1 : -1;
  
    const posts = await Post.find({
      ...(req.query.Author && { Author: req.query.Author }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortingDirection })
      .skip(startIndex)
      .limit(limit);
  
    const totalPosts = await Post.countDocuments();
  
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
  
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
  
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  });

const deletePosts =asyncHandler(async(req, res, next)=>{
    if(!req.user.isAdmin){
        throw new ApiError(403,"You  are not allowed to delte this post")
    }
    await Post.findByIdaAndDelete(Post._id)
    res.status(200).json('The post has been deleted')
})


const updatePost = asyncHandler(async(req, res, next)=>{
    if(!req.user.isAdmin){
        throw new ApiError(403, " you are not allowed to update this post");

    }
    Post.findByIdaAndUpdate(
        req.params.postId,
        {
            $set: {
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                image: req.body.image,
              },
        },
        {new:true}
    )

    res.status(200).json(updatedPost)

})


export {

    createPosts,
    getPosts,
    deletePosts,
    updatePost

}