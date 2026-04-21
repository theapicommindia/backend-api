//backend/src/middleware/auth.js
import jwt from "jsonwebtoken";

export const verifyAdmin=(req,res,next)=>{
    const authHeader=req.cookies.token;

    if(!authHeader){
        return res.status(401).json({message:"Access denied no token provided"});
    }

    try{
        const verified=jwt.verify(authHeader,process.env.JWT_SECRET);
        req.admin=verified;
        next();
    }catch(error){
        res.status(403).json({message:"Invalid or expired token"});
    }
};