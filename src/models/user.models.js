import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

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
        ref: Comment
    }],
    tags:[{
        
    }]

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


export const User = mongoose.model('User',userSchema)