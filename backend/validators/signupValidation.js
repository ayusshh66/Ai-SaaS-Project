import { email, z } from "zod";

export const signUpValidation =  z.object({
    firstName : z.string(),
    lastName : z.string(),
    userName : z.string(),

    email : z.string().email(),

    password : z.string()
    
})


