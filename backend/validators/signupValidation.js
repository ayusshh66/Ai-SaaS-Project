import { email, z } from "zod";

export const signUpValidation =  z.object({
    firstName : z.string(),
    lastName : z.string(),
    userName : z.string(),

    email : z.string().email(),

    password : z.string()
    
})

export const logInValidation =  z.object({
    identifier : z.string().min(1,"email or username required"),
    password : z.string(1, " password required"),
})

export const idValidation =  z.object({
    id : z.string(),
    password : z.string()
})
