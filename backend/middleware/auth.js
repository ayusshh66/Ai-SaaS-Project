import jwt from "jsonwebtoken"
import express from 'express'

export const authentication = async(req,res,next) => {
    try {
        const header = req.headers["authorization"];

        if(!header) {
            return res.status(400).json({error : `no token has been provided`})
        }

        if(!header.startsWith("Bearer")){
            return res.status(400).json({error : `the token must start with Bearer`})
        }

        const [_,token]  = header.split(' ');

        const decode = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decode;

        return next()

    } catch (error) {
        return console.log(error)
    }
} 