import express from 'express';
import { logInValidation, signUpValidation, idValidation } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { usersTable } from '../models/user.model.js';
import { eq, or, and } from 'drizzle-orm';
import { createHmac, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { authentication } from '../middleware/auth.js';

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

router.get("/me", authentication, async (req,res) => {
    return res.status(201).json({data : req.user})
})

router.delete("/delete", authentication, async (req, res) => {
  try {
    const request = await idValidation.safeParseAsync(req.body);

    if (request.error) {
      return res.status(400).json({ error: request.error.format() });
    }

    const { id, password } = request.data;

    const [notty] = await db
      .select({
        salt: usersTable.salt,
        password: usersTable.password,
        userid: usersTable.id,
        userName: usersTable.userName, 
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!notty) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const salt = notty.salt;
    const oldHashedPassword = notty.password;

    const newHashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    if (oldHashedPassword !== newHashedPassword || id !== notty.userid) {
      return res.status(400).json({ error: "you have entered incorrect id or password" });
    }

    await db.delete(usersTable).where(eq(usersTable.id, id))

    return res.status(200).json({
      message: `the account with username ${notty.userName} has been deleted at `,
      time: new Date(),
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch("/update", authentication, async (req,res) => {

    const request = await idValidation.safeParseAsync(req.body);

    if(request.error){
        return res.status(400).json({error : (await request).error.format()});
    }

    const {id, password} = request.data;

    const [exisitingUser] = await db.select({
        id : usersTable.id,
        userName : usersTable.userName,
        password : usersTable.password,
        salt : usersTable.salt,
    }).from(usersTable).where(eq(usersTable.id,id));

    const salt = exisitingUser.salt;
    const oldHashedPassword = exisitingUser.password;

    const newHashedPassword = createHmac("sha256", salt).update(password).digest("hex")

    if(oldHashedPassword !== newHashedPassword || id !== exisitingUser.id){
        return res.status(400).json({error : `the id or username is wrong try again`})
    }

    const {newUserName} = req.body;

    const [update] = await db.update(usersTable).set({newUserName}).where(eq(usersTable.id,id)).returning({ updated : newUserName})

    if(!update){
        return res.status(400).json({error : `profile not found`})
    }

    return res.status(200).json({ status : `success`, message : ` the userName ${newUserName} has been updated`})

})
export default router;