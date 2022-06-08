import app from "../../app"
import supertest from "supertest"
import request from "supertest"
import {DataSource} from "typeorm"
import AppDataSource from "../../data-source"
import {Request, Response, NextFunction} from "express"

import { validateToken } from "../../middlewares"

import jwt from "jsonwebtoken"


describe("Create User Test", () => {
    const mockReq: Partial<Request> = {}
    const _: Partial<Response> = {}
    const nextFunc: NextFunction = jest.fn

    let token = ""

    const createUser = {
        firstName: "Kenzie",
        lastName: "Kenzinho",
        email: "blabla@mail.com",
        password: "123456",
        isAdm: true
    }

    const login = {
        email: "blabla@mail.com",
        password: "123456"
    }

    let connection: DataSource

    beforeAll(async () => {
        await AppDataSource.initialize()
        .then((res) => connection = res)
        .catch((err) => {
            console.error("Error during data Source initialization", err)
        })
    })

    afterAll(async () => {
        await connection.destroy()
    })

    it("Should be able to Create User | Status 201 - Created", async () => {
        const response = await supertest(app).post("/users").send({...createUser})

        expect(response.statusCode).toBe(201)
        expect(response.body).toHaveProperty("email")
    })

    it("Should not be able to Create User | Status 409 - Conflict", async () => {
        const response = await supertest(app).post("/users").send({...createUser})

        expect(response.statusCode).toBe(409)
        expect(response.body).toStrictEqual({message: "Email already exists"})
    })

    it("Should be able to Login | Status 200 - OK", async () => {
        const response = await supertest(app).post("/login").send({...login})

        token = response.body.token

        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("token")
    })

    it("Should be able to return All Users | Status 200 - OK", async () => {
        const response = await request(app).get("/users").set('Authorization', `Bearer ${token}`)

        mockReq.headers = {
            authorization: `Token ${token}`
        }

        validateToken(mockReq as Request, _ as Response, nextFunc)

        expect(mockReq).toHaveProperty("decoded")
        expect(response.statusCode).toBe(200)
    })

    it("Should be able to update a User", async () => {
        const response = await supertest(app).patch(`/users/${mockReq.decoded.id}`).set("Authorization", `Bearer ${token}`).send({
            firstName: "Mudou o primeiro nome",
            lastName: "Mudou o último nome"
        })

        mockReq.headers = {
            authorization: `Token ${token}`
        }
        
        validateToken(mockReq as Request, _ as Response, nextFunc)

        expect(mockReq).toHaveProperty("decoded")
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("firstName", "Mudou o primeiro nome")
        expect(response.body).toHaveProperty("lastName", "Mudou o último nome")
    })

    it("Should be able to Get User by ID", async () => {
        const response = await supertest(app).get(`/users/${mockReq.decoded.id}`).set("Authorization", `Bearer ${token}`)

        mockReq.headers = {
            authorization: `Token ${token}`
        }
        
        validateToken(mockReq as Request, _ as Response, nextFunc)

        expect(mockReq).toHaveProperty("decoded")
        expect(response.statusCode).toBe(200)
    })
})