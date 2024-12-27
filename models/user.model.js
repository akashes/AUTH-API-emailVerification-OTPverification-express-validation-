import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:String,
        required:true

    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Number,
        default:0

    },
    avatar:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:""
    }

})

const User = mongoose.model("User", userSchema);
export default User 