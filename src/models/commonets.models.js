import mongoose from 'mongoose';
import { User } from './user.models';
import { Post } from './post.models';

const commentSchema= new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    post:{
        type: String,
        ref: Post,
        required: true

    }
}, {timestamps: true});

export const Comment = mongoose.model('Comment',commentSchema)
