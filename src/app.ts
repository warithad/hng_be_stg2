import dotenv from 'dotenv'
import express,{ Request, Response } from 'express'
import userRoutes from './routes/user.routes'
import organisationRoutes from './routes/organisation.routes'
import authRoutes from './routes/auth.routes'
dotenv.config()

const port = process.env.PORT || 3000

const app = express()
app.use(express.json())


app.use('/api/users', userRoutes)
app.use('/api/organisations', organisationRoutes)
app.use('/auth', authRoutes)

app.listen(port, ()=>{
    console.log(`App is listening on port: ${port}`)
})

export default app