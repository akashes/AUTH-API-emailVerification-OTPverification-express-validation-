import { validationResult } from "express-validator"
import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import randomString from 'randomstring'
import jwt from 'jsonwebtoken'
import path from 'path'

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Blacklist from "../models/blacklist.model.js"
import Otp from "../models/otp.model.js"

import fs from 'fs'
import { resetPassword, sendVerifyMail, sendVerifyOtpMail } from "../helpers/nodemailer.js"
import { deleteFile } from "../helpers/deleteFile.js"
import { threeMinuteExpiry } from "../helpers/otpValidate.js"

const hashPassword=async(password)=>{
    return await bcrypt.hash(password,10)

}
const generateAccessToken=async(id)=>{
    return await jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'})
    
}
const generateRefreshToken=async(id)=>{
    return await jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
    
}
 

export const registerUser=async(req,res)=>{
    try {
        console.log(req.file.filename)
       const errors= validationResult(req)
    //    if(!errors.isEmpty()){
    //     if(req.file){
    //         fs.unlink(`./public/images/${req.file.filename}`,(err)=>{
    //             if(err) console.log("failed to delete file,err")
    //         })
    //     }
    //     return res.status(400).json({msg:"Invalid input",errors:errors.array()})

    //    }
        const{name,email,mobile,password}=req.body
        console.log(name,email,mobile,password)
        const userExist=await User.findOne({email})
        if(userExist){
            console.log('yes')
        }else{
            console.log('no')
        }
        console.log(userExist)
        if(userExist) return res.status(400).json({msg:"User already exist"})

            const avatar  = req.file? req.file.filename :""
            console.log(avatar)
            const hashedPassword=await hashPassword(password)
            const user = new User({
                name,email,mobile,password:hashedPassword,avatar,isVerified:0
            })
            const newUser = await user.save()
            await sendVerifyMail(newUser.name,newUser.email,newUser._id)


            console.log(user)
            res.status(200).json({
                success:true,
                msg:"User created successfully",
                data:user
            })
        
    } catch (error) {
        console.log('inside error')
        console.log(error)
   
        res.status(400).json({
            success:false,
            msg:"Error creating user",
        })

        
    }
} 

export const loginUser=async(req,res)=>{
    try {
        const{email,password}=req.body
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"Email and password is incorrect"})

            const isValidPassword = await bcrypt.compare(password,user.password)
            if(!isValidPassword) return res.status(400).json({message:"Email and password is incorrect"})
                if(user.isVerified===0) return res.status(400).json({message:"Please verify your mail before logging in"})
                const accessToken = await generateAccessToken(user._id)
                const refreshToken = await generateRefreshToken(user._id)
            
                res.status(200).json({
            success:true,
            msg:"User logged in successfully",
            data:user,
            accessToken,
            refreshToken,
            tokenType:"Bearer"
            })
    } catch (error) {
        console.log(error)
        
    }
}

export const verifyUser=async(req,res)=>{
    try {
      
        const{id}=req.query
        if(!id) return res.render('404',{message:"Invalid id"})
        const user = await User.findOne({_id:id})
    
        if(!user) return res.render('verificationPage',{message:"Cannot find user"})
            user.isVerified=1
        await user.save()
       res.render('verificationPage',{message:"User verification successfull"})
    } catch (error) {
        console.log(error) 
        res.render('404')
        
    }
}

export const loadForgetPassword = async (req, res) => {
    try {
        res.render('resetPassword')
    } catch (error) {
        
    }
};

export const forgetPassword=async(req,res)=>{
    try {
        
        const {email}=req.body
        const user = await User.findOne({email})
        const token = randomString.generate(8)
        user.token = token 
        await user.save()
        resetPassword(user.name,user.email,user.token)
        res.status(200).json({
            success:true,
            msg:"Password reset link sent to your email",
        })

    } catch (error) {
        console.log(error)
        
    }
}

export const loadResetPassword = async (req, res) => {
    console.log('inside load reset password')
    const {token }=req.query
    console.log(token)
    const userData = await User.findOne({token})
    console.log(userData)
    try {
        res.render('newPassword',{userData})
        
    } catch (error) {
        
        console.log(error)
    }
};
export const resetPasswordController = async (req, res) => {
    try {
        const {password,token}=req.body
        console.log(password,token)
        if(!token) return res.render('404',{message:"Invalid token"})
            const user = await User.findOne({token})
        const hashedPassword=await hashPassword(password)
        user.password = hashedPassword
        user.token = null
        await user.save()
        res.render('success')
        
    } catch (error) {
        console.log(error)
        
    }
};  

export const testApi=async(req,res)=>{
    try {
        console.log(req.user)
        res.status(200).json({
            success:true,
            msg:"API is working",
        })
    } catch (error) {
        console.log(error)
    }
}

export const getProfile=async(req,res)=>{
    try 
    {
        const {id}=req.user
        const user = await User.findById(id)


        return res.status(200).json({
            success:true,
            message:"User Profile",
            data:user
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success:false,
            message:"Error"
        })
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const {id}=req.user
        const {name,email,mobile}=req.body
        const data={
            name,
            email,
            mobile
        }
        
        if(req.file!==undefined){
            // add new file name to data object to update
            data.avatar=req.file.filename

           const user =await User.findById(id)

           //fetch user's old avatar
         const oldFilePath=  path.join(__dirname,'../public/images/'+user.avatar)
         //delete image only if image existing in db(old image) is not same as new image
         if(user.avatar!==data.avatar){
            await deleteFile(oldFilePath)
            console.log('Old profile image deleted')

         }
           
        

        }

        const updated=await User.findByIdAndUpdate(id,{$set:data },{new:true})
        res.status(200).json({
            success:true,
            message:"Profile Updated",
            data:updated
        })
    } catch (error) {
        console.log(error)
        res.status({
            success:false,
            message:"Error"
        })
    }
}


export const refreshTokenVerify=async(req,res)=>{
    try {
        const{id}=req.user
        console.log(id)
      const accessToken=  await generateAccessToken(id)
      const refreshToken= await  generateRefreshToken(id)

      res.status(200).json({
        success:true,
        message:"Token refreshed",
        accessToken,
        refreshToken
      })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success:false,
            message:"Error"

        })
    }
}


export const handleLogout = async (req, res) => {
    try {
        const BearerToken =  req.header('Authorization')
        const token = BearerToken.split(' ')[1]

        const expiresAt=new Date(Date.now()+1*60*1000)
       const newBlackList=  new Blacklist({
            token,
            expiresAt
        })
        await newBlackList.save()

        res.setHeader('Clear-site-Data','"cookies","storage"')
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })

        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: "Error"
        })
    }
};

export const sendOtp = async (req, res) => {
    try {

        const{email}=req.body

        const user = await User.findOne({email})
        if(!user) return res.status(400).json({
            success: false,
            message: "User not found"
        })
        // if(user.isVerified===1){
        //     return res.status(400).json({
        //         success: false,
        //         message: "User is already verified"
        //     })
        // }

      await  sendVerifyOtpMail(res,user.name,user.email,user._id)

     


       

        
    } catch (error) {
        console.log(error)
        res.status(200).json({
            success: false,
            message: "Error"
        })
        
    }
};



export const verifyOtp=async(req,res)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: errors.array()
            })
        }
        const{user_id,otp}=req.body
       const otpData = await Otp.findOne({
            user_id,
            otp
        })

        if(!otpData) return res.status(400).json({
            success: false,
            message: "Invalid OTP"
        })
      const isOtpExpired= await threeMinuteExpiry(otpData.timestamp)
      if(isOtpExpired){
        return res.status(400).json({
            success: false,
            message: "OTP is expired"
        })

      }
       await User.findByIdAndUpdate({_id:user_id},{
        $set:{
            isVerified:1
        }
      })

      return res.status(200).json({
        success: true,
        message: "Account verified successfully"
      })
        
        
    } catch (error) {
        console.log(error)
    }
}