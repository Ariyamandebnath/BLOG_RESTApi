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
    }
});

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