import request from "supertest";
import app from "../src/app";
import prisma from '../src/prisma'

describe('End to End tests', () =>{
    it('should register user successfully with default organisation', async ()=>{
        //should verify the default organisation is correctly generated
        const res = await request(app)
                    .post('/auth/register')
                    .send({
                      firstName: 'John',
                      lastName: 'Doe',
                      email: 'john@gmail.com',
                      password: 'johnjohnjohn',
                      phone: '123456789'  
                    })
                    .set('Accept', 'application/json')
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toHaveProperty('accessToken')
        expect(res.body.data.accessToken).not.toBeNull()
        expect(res.body.message).toBe('Registration successful')
        
        const org = await prisma.organisation.findFirst({
            where: {
                name: "John's Organisation"
            }
        })
        expect(org).not.toBe(null)
    })
    it('should log the user in successfully', async()=>{
        //check that the response contains the expected user details and access token'
        const res = await request(app)
                            .post('/auth/login')
                            .send({
                                email: 'john@gmail.com',
                                password: 'johnjohnjohn'
                            })
                            .set('Accept', 'application/json')
        expect(res.status).toBe(200)
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Login successful')
        expect(res.body.data).toHaveProperty('accessToken')
        expect(res.body.data).toHaveProperty('user')
        expect(res.body.data.accessToken).not.toBeNull()
        expect(res.body.data.user.email).toBe('john@gmail.com')
        expect(res.body.data.user).not.toHaveProperty('password')
    })

    it('should fail if the required fields are missing', async()=>{
        //should verify the response status code of 422 and appropriate error messages
    
        const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'janejanejane',
          phone: '123456789'  
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(422)
        expect(res.body).toHaveProperty('errors')
    })
    it('should fail if theres duplicated email or userId', async()=>{
        //should verify the response status code of 422 and appropriate error messages
    
        const res = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@gmail.com',
          password: 'johnjohnjohn',
          phone: '123456789'  
        })
        .set('Accept', 'application/json')
    
        expect(res.status).toBe(422)
        expect(res.body.status).toBe('Bad request')
        expect(res.body.message).toBe('Registration unsuccessful')
    })

    afterAll(async ()=>{
        await prisma.organisationUser.deleteMany()
        await prisma.user.deleteMany()
        await prisma.organisation.deleteMany()
    })
})

