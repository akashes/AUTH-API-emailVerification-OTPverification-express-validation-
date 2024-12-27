import nodemailer from 'nodemailer'
import Otp from '../models/otp.model.js';
import { oneMinuteExpiry } from './otpValidate.js';


const generateOtpNumber=async()=>{
    return  Math.floor(1000 + Math.random() * 9000); //1000 to 9999
}


export const sendVerifyMail=async(name,email,id)=>{
    console.log('inside serndverify util')
    console.log(name,email,id)

    try {

      const transporter=  nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMTP_PASSWORD,
            }
        })

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to:email,
            subject:'For Verification mail',
            html:'<p>Hi '+ name +' , please click here to <a href="http://127.0.0.1:8080/api/user/verify?id='+id+'"> Verify </a> your mail. </p> '
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Email has been sent :- ", info.response)
            }

        })
        
    } catch (error) {
        console.log(error)
        
    }

}


export const resetPassword=async(name,email,token)=>{
    console.log('inside resetPassword util')

    try {

      const transporter=  nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMTP_PASSWORD,
            }
        })

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hi '+ name +' , please click here to <a href="http://127.0.0.1:8080/api/user/reset-password?token='+token+'"> Reset </a> your Password. </p> '
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Email has been sent :- ", info.response)
            }

        })
        
    } catch (error) {
        console.log(error)
        
    }

}


export const sendVerifyOtpMail=async(res,name,email,id)=>{

    try {

      const transporter=  nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMTP_PASSWORD,
            }
        })

      const otp = await  generateOtpNumber()

    const oldOtpData=  await Otp.findOne({
        user_id:id
      })
      if(oldOtpData){
       const sendNextOtp= await oneMinuteExpiry(oldOtpData.timestamp)
       if(!sendNextOtp){
        return res.status(400).json({
            success:false,
            message:"Please try after some time"
        })
       }

      }

      await Otp.findOneAndUpdate(
        {user_id:id},
        {otp,timestamp:new Date(new Date().getTime())},
        {upsert:true,new:true,setDefaultsOnInsert:true}
      )

  

 
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to:email,
            subject:'Otp verification',
            html:'<p>   Hi <b> '+ name +'<br>, </br> <h4>' +otp + '  </h4> is your OTP  </p> '
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Otp has been sent to your mail , please check")
            }

        })
        res.status(200).json({
            success:true,
            message:'Otp has been sent to your mail , please check'
        })
        
        
    } catch (error) {
        console.log(error)
        
    }

}