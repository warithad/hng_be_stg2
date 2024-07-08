import { z } from "zod"

export const UserCreateSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string(),
    phone: z.string().optional()
})


export const UserLoginSchema = z.object({
  email: z.string(),
  password: z.string()  
})

export const CreateOrgSchema = z.object({
    name: z.string(),
    description: z.string().optional()
})
