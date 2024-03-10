import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
        type:String,
        required:true,

    },
    image:String,
    content:{
        type:String,
        required: true,
    },
    catagory:{
        type:"String",
        default:"uncategorized",
    },
    username:String,
    
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    }]
},{
    timestamps: true
})

export const Post = mongoose.model('Post', postSchema);