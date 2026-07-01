import { boolean, email, z } from "zod";

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

export const pantryItemValidation = z.object({
    name : z.string(),
    quantity : z.number(),
    unit : z.string(),
    category : z.string(),
    expiry_date : z.string(),
    is_running_low : boolean(),
})

export const idPantryValidation = z.object({
    id : z.string(),
})

export const pantryQuerySchema = z.object({
  category: z.string().trim().optional(),

  search: z.string().trim().min(1).optional(),

  isRunningLow: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(50).default(10),
});


