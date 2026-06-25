import express from 'express';
import { logInValidation, signUpValidation } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { usersTable } from '../models/user.model.js';
import { eq, or } from 'drizzle-orm';
import { createHmac, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const router = express.Router();

router.post('/signup', async(req,res) => {
    try {

    const request = await signUpValidation.safeParseAsync(req.body);

    if(request.error){
        return res.status(400).json({error : request.error.format()})
    }

    const {firstName, lastName, userName, password, email} = request.data;

    const [existingUser] = await db
                            .select()
                            .from(usersTable)
                            .where(or(eq(usersTable.email,email), eq(usersTable.userName,userName)))

    if(existingUser){
        return res.status(400).json({error : `the credentials is already used, please try with different email or username`})
    } 
    
    const salt = randomBytes(256).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(password).digest('hex')

    const [user] = await db.insert(usersTable).values({
        firstName,
        lastName,
        userName,
        password : hashedPassword,
        salt : salt,
        email,
    }).returning()

    const token = jwt
                    .sign({id:user.id, email : user.email, firstname : user.firstName }
                    , process.env.JWT_SECRET);
    
    return res.status(201).json({status : `success`, data : {User_id : user.id, token : token, user : {name : firstName+" "+lastName, email : email}}})

    } catch (error) {
        console.error(error.message)
    }
})

router.post('/login', async(req,res) => {
    try {
        const request = await logInValidation.safeParseAsync(req.body);

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const {identifier, password} = request.data;

        const [exisitingUser] = await db.select({
            id : usersTable.id,
            email : usersTable.email,
            name : usersTable.firstName,
            password : usersTable.password,
            salt : usersTable.salt,
        }).from(usersTable).where(or(eq(usersTable.email,identifier), eq(usersTable.userName, identifier)))

        if(!exisitingUser){
            return res.status(400).json({error : ` username or password is wrong, try again`})
        }

        const salt = exisitingUser.salt;
        const oldHashedPassword = exisitingUser.password;
        const newHashedPassword = createHmac("sha256",salt).update(password).digest('hex');

        if(!newHashedPassword === oldHashedPassword){
            return res.status(400).json({error : `the password is not correct, try again`})
        }

        const token = jwt.sign({id : exisitingUser.id , email : exisitingUser.email, name : exisitingUser.name}, process.env.JWT_SECRET);

        return res.status(200).json({status : `success`, data : {
            token : token,
            name : exisitingUser.name,
            email : exisitingUser.email
        }})



    } catch (error) {
        return console.error(error.message)
    }
})
export default router;