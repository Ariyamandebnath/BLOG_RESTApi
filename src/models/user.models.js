import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({

    username :{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required: true
    },
    posts:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }
    ],
    comments:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    tags:[{
        type: mongoose.Schema.ObjectId,
        ref:'Tag'
        
    }],
    profilePicture:{
        type: String, //cloudinary url
        required: true
    },
    refreshTokens:{
        type:String
    }

},{timestamps: true});
//this is a pre-save hook!! This will be executed before the saving a document to the MongoDB database.

userSchema.pre("save", async function(next){
    try {
        if(this.isModified('password')){
           const hashedPassword = bcryptjs.hashSync(this.password,10);
            this.password = hashedPassword;

        }
        next();
    } catch (error) {
        console.log(error);
        next(error);
        
    }
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password, this.password);
}


userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_Expiry
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id : this._id,
           
        },
        process.env.REFERESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFERESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model('User',userSchema)