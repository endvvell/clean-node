import { describe, it, expect, beforeEach } from 'vitest'
import { User } from '../core/entities/user.entity'

describe('User Entity', () => {
	it.concurrent('Should create a valid "User" entity', () => {
		let testData = {
			username: 'someUser',
			password: 'secret_@',
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@gmail.com',
			telegramLink: 'https://t.me/john_doe',
		}

		let testUser = new User({ ...testData })

		expect(testUser.username).toBe(testData.username)
		expect(testUser.password).toBe(testData.password)
		expect(testUser.firstName).toBe(testData.firstName)
		expect(testUser.lastName).toBe(testData.lastName)
		expect(testUser.email).toBe(testData.email)
		expect(testUser.telegramLink).toBe(testData.telegramLink)
	})

	it.concurrent('Should throw error on invalid input', () => {
		let invalidTestData = {
			username: 'some@User',
			password: 'secret',
			firstName:
				'JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn',
			lastName:
				'DoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoe',
			email: 'johndoegmail.com',
			telegramLink: 'http://t.me/doe',
		}

		const checkSetUsername = () =>
			new User({ username: invalidTestData.username })
		const checkSetPassword = () =>
			new User({ password: invalidTestData.password })
		const checkSetFirstName = () =>
			new User({ firstName: invalidTestData.firstName })
		// @ts-ignore
		const checkSetLastName = () =>
			new User({ lastName: invalidTestData.lastName })
		// @ts-ignore
		const checkSetEmail = () => new User({ email: invalidTestData.email })
		const checkSetTelegramLink = () =>
			new User({ telegramLink: invalidTestData.telegramLink })

		expect(checkSetUsername).toThrow()
		expect(checkSetPassword).toThrow()
		expect(checkSetFirstName).toThrow()
		expect(checkSetLastName).toThrow()
		expect(checkSetEmail).toThrow()
		expect(checkSetTelegramLink).toThrow()
	})
})
