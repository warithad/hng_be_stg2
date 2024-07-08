import express, {Request, Response} from 'express'
import prisma from '../prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserCreateSchema, UserLoginSchema } from '../utilities/schemas'
import { ZodError } from 'zod'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const jwt_secret = process.env.JWT_SECRET || 'secret'

router.post('/login', async (req: Request, res: Response) => {
    try{
        const loginData = UserLoginSchema.parse(req.body)
        const user = await prisma.user.findUnique({
            where: {
                email: loginData.email
            }
        })

        if (!user || !bcrypt.compare(loginData.password, user.password)){
            res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401
            })
        }else{
            const accessToken = await generateAccessToken(user.userId)
            const responseData: any = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
              };
            if (user.phone) responseData.phone = user.phone
            
            res.status(200).json({
                status: "success",
                message: "Login successful",
                data: {
                    accessToken,
                    user: responseData
                }
            })
        }
    }catch(e){
        if (e instanceof ZodError){
            const errorDetails = e.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }));
              res.status(422).json({ errors: errorDetails });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
})

router.post('/register', async (req: Request, res: Response) => {
    try{
        const registerData = UserCreateSchema.parse(req.body);
        const existingUser = await prisma.user.findFirst({
            where: {
                email: registerData.email
            }
        })

        if(existingUser){
            res.status(422).json({
                status: "Bad request",
                message: "Registration unsuccessful",
                statusCode: 422
            })
        }
        else{

            registerData.password = await bcrypt.hash(registerData.password, 5)
            const user = await prisma.user.create({
                data: registerData,
            })

            const responseData: any = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };
            if (user.phone) responseData.phone = user.phone
            
            const orgName = `${user.firstName}'s Organisation`
            const organisation = await prisma.organisation.create({
                data: {
                    name: orgName
                }
            })
            const accessToken = generateAccessToken(user.userId)
            console.log(`Access token: ${accessToken}`)
            await prisma.organisationUser.create({
                data: {
                    userId: user.userId,
                    orgId: organisation.orgId
                }
            })

            res.status(201).json({
                status: "success",
                message: "Registration successful",
                data: {
                    accessToken,
                    user: responseData
                }
            })
        }
    }
    catch(e){
        if (e instanceof ZodError){
            const errorDetails = e.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }));
              res.status(422).json({ errors: errorDetails });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
})


function generateAccessToken(userId: string){
    const token = jwt.sign({ userId }, jwt_secret, {
        expiresIn: '6h'
    })
    return token
}
export default router