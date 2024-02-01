import mongoose from 'mongoose';
import { User } from './user.models';

const postSchema = new mongoose.Schema({
    titel:{
        type:String,
        required:true,

    },
    content:{
        type:String,
        required: true,
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
},{
    timestamps: true
})

export const Post = mongoose.model('Post', postSchema);