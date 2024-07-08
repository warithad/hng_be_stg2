import express, {Request, Response} from 'express'
import { UserCreateSchema } from '../utilities/schemas'
import prisma from '../prisma'
import { AuthenticatedRequest, authenticateToken } from '../utilities/middlewares'

const router = express.Router()

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  console.log('Hitting endpoint')
  try {
    if (!req.user){
      res.status(400).json({
        status: "Bad Request",
        message: "Client error",
        statusCode: 400
      })
    }
    else{

      if(req.user.userId !== req.params.id && !checkConnectionBetweenUsers(req.user.userId, req.params.id)){
        res.status(400).json({
          status: "Bad Request",
          message: "Client error",
          statusCode: 400
        })
      }
      const userData = await prisma.user.findUnique({
          select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
          },
          where:{userId: req.params.id}
      })
      res.status(200).json({
          status: "success",
          message: "User found successfully",
          data: userData
      })
    }
    
  } catch(e){
    res.status(500).json({
      message:"Internal server error"
    })
  } 
})


async function checkConnectionBetweenUsers(userId: string, secondUserId: string): Promise<boolean>{
  const userOrgs = await prisma.organisationUser.findMany({
    where: {
      userId
    },
    select: {
      orgId: true
    }
  })

  const userOrgIds = userOrgs.map(userOrg => userOrg.orgId)
  const commonOrgs = await prisma.organisationUser.findMany({
    where: {
      userId: secondUserId,
      orgId: {
        in: userOrgIds
      }
    },
  })

  return commonOrgs.length > 0
}

export default router