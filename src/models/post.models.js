import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    titel:{
        type:String,
        required:true,

    },
    image:String,
    content:{
        type:String,
        required: true,
    },
    username:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    }]
},{
    timestamps: true
})

export const Post = mongoose.model('Post', postSchema);