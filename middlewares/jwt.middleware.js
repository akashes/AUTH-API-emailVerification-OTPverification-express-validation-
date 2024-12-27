import jwt from 'jsonwebtoken'
import Blacklist from '../models/blacklist.model.js'

export const verifyToken=async(req,res,next)=>{



    const BearerToken =  req.header('Authorization')
    console.log(BearerToken)
    if(!BearerToken){
        return res.status(401).json({
            success:false,
            message:'No token provided'
        })
    }

        try {

           

            //spliting done here not initally to avoid error 
            const token = BearerToken.split(' ')[1];
            const isBlackListed = await Blacklist.findOne({token})
            console.log(isBlackListed)
            if(isBlackListed){
                return res.status(401).json({
                    success:false,
                    message:'This session has expired, Please login again'
                })
            }
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            req.user = decoded
            next()
        
            
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:'Invalid token'
            })
             
        } 
    }

 