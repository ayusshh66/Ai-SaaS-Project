import express from 'express';
import { signUpValidation } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { usersTable } from '../models/user.model.js';
import { eq } from 'drizzle-orm';

const route = express.Router();

route.post('/signup', async(req,res) => {
    try {

    const request = await signUpValidation.safeParseAsync(req.body);

    if(request.error){
        return res.status(400).json({error : request.error.format()})
    }

    const {firstName, lastName, userName, password, email} = request.data;

    const [existingUser] = await db
                            .select()
                            .from(usersTable)
                            .where(eq(usersTable.email === email) || eq(usersTable.userName === userName));

    if(existingUser){
        return res.status(400).json({error : `the credentials ${existingUser} is already used, please try with different email or username`})
    } 
    
    


    } catch (error) {
        console.error(error.message)
    }
})