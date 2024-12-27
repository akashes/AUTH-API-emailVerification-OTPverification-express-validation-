import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        mongoose.connect('mongodb://localhost:27017/AUTH-JWT-STUDY')
        console.log('mongodb connection successful')

    } catch (error) {
        console.log(error)

        
    }
}