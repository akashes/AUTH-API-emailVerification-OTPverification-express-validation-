import { check } from "express-validator";

export const registerValidator=[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email",'please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    check("mobile",'Mobile no should contain 10 digits').isLength({
        min:10,
        max:10
    }),
    // check("password").isLength({min:8}).withMessage("Password must be at least 8 characters and atleast one uppercase letter , one lowercase letter , and one number and a special character").isStrongPassword({
    //     minLength:8,
    //     minUppercase:1,
    //     minLowercase:1,
    //     minNumbers:1,
    //     minSymbols:1
    // }),
    check("image",'Mobile no should contain 10 digits').custom((value,{req})=>{
        if(req.file.mimetype==='image/jpeg'|| req.file.mimetype==='image/png'){
            return true;
        }else{
            return false;
        }
    }).withMessage("Please upload an image jpeg,png")

]


export const sendMailVerificationValidator=[
    check('email','Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    })
]

export const verifyOtpValidator=[
    check('user_id','User Id is requried').not().isEmpty(),
    check('otp','Otp is required').not().isEmpty(),
]