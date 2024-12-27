import express from "express";
import { forgetPassword, getProfile, handleLogout, loadForgetPassword, loadResetPassword, loginUser, refreshTokenVerify, registerUser, resetPasswordController, sendOtp, updateProfile, verifyOtp, verifyUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { registerValidator, sendMailVerificationValidator, verifyOtpValidator } from "../helpers/validation.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";
const userRoute = express.Router()

userRoute.post('/registerUser',upload.single('avatar'),registerValidator,registerUser)
userRoute.post('/login',loginUser)
userRoute.get('/verify',verifyUser)

userRoute.get('/forget-password',loadForgetPassword)
userRoute.post('/forget-password',forgetPassword)

userRoute.get('/reset-password',loadResetPassword)
userRoute.post('/reset-password',resetPasswordController)



//authenticated Routes
userRoute.get('/profile',verifyToken,getProfile)
userRoute.post('/update-profile',verifyToken,upload.single('avatar'),updateProfile)

userRoute.get('/refresh-token',verifyToken,refreshTokenVerify)

userRoute.get('/logout',verifyToken,handleLogout)


//otp verification route
userRoute.post('/send-otp',verifyToken,sendOtp)
userRoute.post('/verify-otp',verifyOtpValidator,verifyOtp)

export default userRoute  