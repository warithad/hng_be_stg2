import express, {Request, Response} from 'express'
import { AuthenticatedRequest, authenticateToken } from '../utilities/middlewares'
import prisma from '../prisma'
import { CreateOrgSchema } from '../utilities/schemas'
import { ZodError } from 'zod'


const router = express.Router()

router.get('/:orgId',authenticateToken,  async (req: AuthenticatedRequest, res: Response) => {
    if(!req.user) {
        res.status(401).json()
    }else{
        const userExistsInOrg = await prisma.organisationUser.findUnique({
            where:{ 
                userId_orgId: {
                    orgId: req.params.orgId,
                    userId: req.user.userId
                }
            }
        })
        if(!userExistsInOrg){
            res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            })
        }
        const organisation = await prisma.organisation.findUnique({
            where: {
                orgId: req.params.orgId
            }
        })
        if (!organisation) res.status(404).json({message: "Organisation not found"})
        else{
            res.status(200).json({
                status: "success",
                message: "Oo something",
                data: organisation
            })
        }
    }
    
})

router.post('/:orgId/users/', async (req: Request, res: Response) => {
    try{
        const user = await prisma.user.findUnique({
            where: {
                userId: req.body.userId
            }
        })
        const organisation = await prisma.organisation.findUnique({
            where:{
                orgId: req.params.orgId
            }
        })
    
        if(!user || !organisation){
            res.status(400).json({
                
            })
        }
        else{
            const orgUser = await prisma.organisationUser.create({
            data:{
                orgId: organisation.orgId,
                userId: user.userId
            }})
            if( orgUser ){
                res.status(200).json({
                    status: "success",
                    message: "User added to organisation succesfully"
                })
            }
        }    
    }catch(e){
        
    }
    
})

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user){
            res.status(400).json({
                status: "Bad Request",
                message: "Client error",
                statusCode: 400
            })
        }
        else {
            const {name, description} = CreateOrgSchema.parse(req.body);
            const organisation = await prisma.organisation.create({
                data: {
                    name,
                    description
                }
            })
            const userOrg = await prisma.organisationUser.create({
                data:{
                    orgId: organisation.orgId,
                    userId: req.user.userId
                }
            })
        }
        
    }catch(e){
        if (e instanceof ZodError){
            res.status(400).json({
                status: "Bad Request",
                message: "Client error",
                statusCode: 400
            })
        
        }
    }
})
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try{
        const organisations = await prisma.organisationUser.findMany({
            where: {
                userId: req.user?.userId
            }
        })
        res.json({
            status: "success",
            message: "",
            data: {
                organisations
            }
        })
    }catch(e){

    }
})

export default router