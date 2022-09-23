import {
	it,
	expect,
	describe,
	beforeEach,
	afterAll,
	beforeAll,
	afterEach,
} from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { DATABASE_IN_USE } from '../config/ENV_global'
import mongoose from 'mongoose'
import { MONGO_URI } from '../config/ENV_mongo'
import { PrismaClient } from '@prisma/client'
import { userControllers } from '../infra/controllers/routes/user.router'
import { User } from '../core/entities/user.entity'
import { logger } from '../logger/prodLogger'

let app: any
let testUserId: string
let oldUserId: string

beforeAll(async () => {
	if (DATABASE_IN_USE === 'mongodb') {
		try {
			await mongoose.connect(MONGO_URI).then(() => {
				console.log('(TEST) Successfully connected to MongoDB')
			})
		} catch (error) {
			logger.error(`(TEST)Error while connecting to MongoDB: ${error}`)
		}
	} else {
		try {
			const prisma = new PrismaClient()
			await prisma.$queryRaw`SELECT 1+1`
			console.log('(TEST) Successfully connected to Postgres')
		} catch (error) {
			logger.error(`(TEST) Error while connecting to Postgres: ${error}`)
		}
	}

	app = createApp()
}) // could probably just make it so both connections are established and setup two userControllers with different connection each

afterAll(async () => {
	try {
		const foundUser = await userControllers.getUser(
			new User({ username: 'testUser' }),
		)
		if (foundUser.data !== 'User not found')
			await userControllers.deleteUser({ data: { id: testUserId } })
	} catch (error) {
		logger.error(
			`(TEST) Error while trying to delete a user in "afterAll": ${error}`,
		)
	}
})

beforeEach(async () => {
	const foundUser = await userControllers.getUser(
		new User({ username: 'testUser' }),
	)

	if (foundUser.data !== 'User not found') {
		testUserId = foundUser.data.id.toString()
		process.env['oldUserId'] = testUserId
	}
})

describe('Express Routers', () => {
	// afterEach(async () => {
	// 	oldUserId = testUserId
	// 	if (DATABASE_IN_USE === 'mongodb') {
	// 		try {
	// 			await mongoose.connect(MONGO_URI)
	// 		} catch (error) {
	// 			logger.error(
	// 				`(TEST)Error while connecting to MongoDB: ${error}`,
	// 			)
	// 		}
	// 	} else {
	// 		try {
	// 			const prisma = new PrismaClient()
	// 			await prisma.$queryRaw`SELECT 1+1`
	// 		} catch (error) {
	// 			logger.error(
	// 				`(TEST) Error while connecting to Postgres: ${error}`,
	// 			)
	// 		}
	// 	}

	// 	app = createApp()
	// })
	describe('create user route:', () => {
		it('should return a 201 response with valid created user:', async () => {
			const requestData = {
				username: 'testUser',
				password: 'secret@##',
				firstName: 'John',
				lastName: 'Doe',
			}
			const res = await request(app)
				.post('/api/users/create')
				.send(requestData)

			expect(res.statusCode).toBe(201)
			expect(res.body.status).toBe('success')
			expect(res.body.data.username).toBe('testUser')
			expect(res.body.data).not.toHaveProperty('password')

			testUserId = res.body.data.id
		})
		it('should return "rejected" message with 400 status code if the input was invalid', async () => {
			const requestData = {
				username: 'some invalid username',
				password: 'short',
				firstName: 'John',
				lastName: 'Doe',
			}
			const res = await request(app)
				.post('/api/users/create')
				.send(requestData)

			expect(res.statusCode).toBe(400)
			expect(res.body.status).toBe('failed')
			expect(res.body).toHaveProperty('reason')
			expect(res.body.reason).toBeTruthy()
		})
	})
	describe('get one user:', () => {
		it(`should get one users from db by the id`, async () => {
			const res = await request(app).get(`/api/users/${testUserId}`)

			expect(res.statusCode).toBe(200)
			expect(res.body.status).toBe('success')
			expect(res.body.data).not.toHaveProperty('password')
		})
		it('should return "rejected" message with 400 status code if the input ID was provided', async () => {
			const res = await request(app).get(`/api/users/invalid_id`)

			expect(res.statusCode).toBe(400)
			expect(res.body.status).toBe('failed')
			expect(res.body).toHaveProperty('reason')
			expect(res.body.reason).toBe('Invalid ID')
		})
		it('should return "rejected" message with 404 status code if user with the provided id wasn\'t found', async () => {
			let res
			if (DATABASE_IN_USE === 'mongodb') {
				const random_id = new mongoose.Types.ObjectId()
				res = await request(app).get(
					`/api/users/${random_id.toString()}`,
				)
			} else {
				res = await request(app).get(`/api/users/9999999999`)
			}

			expect(res.statusCode).toBe(404)
			expect(res.body.status).toBe('failed')
			expect(res.body).toHaveProperty('reason')
			expect(res.body.reason).toBe('User not found')
		})
	})
	describe('get many users:', () => {
		it('should get 10 users from db', async () => {
			const res = await request(app).get('/api/users')

			expect(res.statusCode).toBe(200)
			expect(res.body.status).toBe('success')
			expect(res.body.data.length).toBe(10)
			expect(res.body.data[0]).not.toHaveProperty('password')
		})
		// can't come up with a way to make prisma client close all connections while running supertest, since the UserRepo is instantiated in routers when the app gets executed in "request(app).get(`/api/users/`)"
		// it ('should return "rejected" message with 500 status code if there was an error returning the users', async () => {
		// 	const res = request(app)

		// 	if (DATABASE_IN_USE === 'mongodb') {
		// 		await mongoose.disconnect()
		// 	} else {
		// 		await new PrismaClient().$disconnect()
		// 	}

		// 	const completedRes = await res.get(`/api/users/`)

		// 	expect(completedRes.statusCode).toBe(500)
		// 	expect(completedRes.body.status).toBe('failed')
		//     expect(completedRes.body).toHaveProperty('reason')
		// 	expect(completedRes.body.reason).toBe('Error while processing data')
		// })
	})
	describe('update one user', () => {
		it(`update user by id with username "updatedUser" and firstName of "updatedFname"`, async () => {
			const newInfo = {
				username: 'updatedUser',
				firstName: 'updatedFname',
			}

			const res = await request(app)
				.patch(`/api/users/${testUserId}`)
				.send(newInfo)

			expect(res.statusCode).toBe(200)
			expect(res.body.status).toBe('success')
			expect(res.body.data.username).toBe(newInfo.username)
			expect(res.body.data.firstName).toBe(newInfo.firstName)
			expect(res.body.data).not.toHaveProperty('password')
		})
		it('should return "rejected" message with 400 status code if invalid input was provided', async () => {
			const newInfo = {
				username: 'updated invalid username',
				firstName: 'updatedF name',
			}

			const res = await request(app)
				.patch(`/api/users/${testUserId}`)
				.send(newInfo)
			expect(res.statusCode).toBe(400)
			expect(res.body.status).toBe('failed')
			expect(res.body).toHaveProperty('reason')
			expect(res.body.reason).toBeTruthy()
		})
	})
	describe('delete the test user', () => {
		it(`should deleted a previously created user by id`, async () => {
			testUserId = await (
				await userControllers.getUser(
					new User({ username: 'updatedUser' }),
				)
			).data.id.toString()
			const res = await request(app).delete(`/api/users/${testUserId}`)

			expect(res.statusCode).toBe(200)
			expect(res.body.status).toBe('success')
			expect(res.body.data).toBe('User deleted successfully')
		})
		it(`should return failed response with "Invalid ID" as a reason`, async () => {
			const res = await request(app).delete(`/api/users/invalid_id`)

			expect(res.statusCode).toBe(400)
			expect(res.body.status).toBe('failed')
			expect(res.body.reason).toBe('Invalid ID')
		})
		it(`should return failed response if user with the provided id wasn't found`, async () => {
			const res = await request(app).delete(
				`/api/users/${process.env['oldUserId']}`,
			)
			expect(res.statusCode).toBe(404)
			expect(res.body.status).toBe('failed')
			expect(res.body.reason).toBe('User not found')
		})
	})
})
