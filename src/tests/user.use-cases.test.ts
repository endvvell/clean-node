import { describe, it, expect, vi, afterEach } from 'vitest'
import { UserDTOIn } from '../core/abstracts/user/user.dto.abstract'
import { UserRepo } from '../core/abstracts/user/user.repo.abstract'
import { User } from '../core/entities/user.entity'
import { nowTime } from '../core/helpers'
import * as UserUseCases from '../core/use-cases/user.use-cases'

const testDB: { [key: string]: { [key in keyof Partial<User>]: any } } = {
	entry1: {
		id: 15,
		username: 'bob',
		password: '123',
		firstName: 'Robert',
		lastName: 'Doe',
	},
	entry2: {
		id: 4,
		username: 'johny',
		password: '123',
		firstName: 'John',
		lastName: 'Doe',
	},
	entry3: {
		id: 35,
		username: 'someUser123',
		password: '123',
		firstName: null,
		lastName: null,
	},
}

class testRepo extends UserRepo {
	formattedError(error: any) {
		throw new Error('Method not implemented.')
	}
	exists(criteriaObj: any): Promise<boolean> {
		throw new Error('Method not implemented.')
	}
	async getMany(criteriaObj: UserDTOIn): Promise<User[]> {
		if (criteriaObj.data.field === '_invalid_field_') {
			throw new Error('Invalid Field')
		}
		const resultArray: User[] = []
		Object.keys(testDB).forEach((entry) => {
			if (
				// @ts-ignore
				testDB[entry][criteriaObj.data.field] ===
				criteriaObj.data.criteria
			) {
				delete testDB[entry].password
				resultArray.push(new User({ ...testDB[entry] }))
			}
		})

		if (resultArray.length === 0) {
			resultArray.push(new User({ id: 'no users found' }))
		}

		return resultArray
	}

	async getOne(criteriaObj: UserDTOIn): Promise<User> {
		if (criteriaObj.data.field === '_invalid_field_') {
			throw new Error('Invalid Field')
		}

		let foundUser = new User({ id: 'users not found' })
		for (let i = 0; i < Object.keys(testDB).length; i++) {
			if (
				// @ts-ignore
				testDB[Object.keys(testDB)[i]][criteriaObj.data.field] ===
				criteriaObj.data.criteria
			) {
				delete testDB[Object.keys(testDB)[i]].password
				foundUser = new User({ ...testDB[Object.keys(testDB)[i]] })
				break
			}
		}
		return foundUser
	}
	async create(dataObj: UserDTOIn): Promise<User> {
		if (
			dataObj.data.username === '_some_invalid_username_' ||
			Object.keys(dataObj.data).length < 1
		) {
			throw new Error('(From test) whatever')
		}

		delete dataObj.data.password
		const newUser = { ...dataObj.data }
		const createdUser = new User({
			...newUser,
			id: Object.keys(testDB).length,
			dateJoined: nowTime(),
			lastLogin: nowTime(),
		})
		testDB['entity' + `${Object.keys(testDB).length + 1}`] = newUser

		return createdUser
	}
	async update(dataObj: UserDTOIn): Promise<User> {
		if (
			dataObj.data.username === '_invalid_data_' ||
			Object.keys(dataObj.data).length < 1
		) {
			throw new Error('(From test) whatever')
		}

		let updatedUser = new User({ id: 'user not found' })
		for (let i = 0; i < Object.keys(testDB).length; i++) {
			if (
				// @ts-ignore
				testDB[Object.keys(testDB)[i]][dataObj.data.field] ===
				dataObj.data.criteria
			) {
				updatedUser = new User({ ...testDB[Object.keys(testDB)[i]] })

				Object.keys(dataObj.data).forEach((key) => {
					// @ts-ignore
					updatedUser[key] = dataObj.data[key]
				})

				delete updatedUser.password
				break
			}
		}

		if (updatedUser.id !== 'user not found') {
			return updatedUser
		} else {
			throw new Error('(From test) whatever')
		}
	}
	async delete(criteriaObj: UserDTOIn): Promise<void> {
		let deletedUser: string = ''
		for (let i = 0; i < Object.keys(testDB).length; i++) {
			if (
				// @ts-ignore
				testDB[Object.keys(testDB)[i]][criteriaObj.data.field] ===
				criteriaObj.data.criteria
			) {
				deletedUser = 'User deleted successfully'
				break
			}
		}

		if (!!deletedUser) {
			return
		} else {
			throw new Error('no user found')
		}
	}
}

const testUserCases = new UserUseCases.UserUseCases(new testRepo())
vi.spyOn(testUserCases, 'getOneUser')
vi.spyOn(testUserCases, 'getManyUsers')
vi.spyOn(testUserCases, 'createNewUser')
vi.spyOn(testUserCases, 'updateUser')
vi.spyOn(testUserCases, 'deleteUser')

describe('User use cases:', () => {
	// getOneUser()
	describe('getOneUser()', () => {
		afterEach(() => {
			vi.clearAllMocks()
		})
		it('should return one found user with a valid info', async () => {
			const inputUserObj = new User({ username: 'bob' })
			const foundUser = await testUserCases.getOneUser({
				data: {
					field: 'username',
					criteria: inputUserObj.username,
				},
			})
			expect(testUserCases.getOneUser).toHaveBeenCalledTimes(1)
			expect(foundUser.data).toBeInstanceOf(User)
			expect(foundUser.data.username).toBe('bob')
			expect(foundUser.data.firstName).toBe('Robert')
			expect(foundUser.data.password).toBe(null)
		})

		it('should return {data: "User not found"} if no user was found', async () => {
			const notFoundUser = await testUserCases.getOneUser({
				data: { field: 'username', criteria: 'sam' },
			})

			expect(testUserCases.getOneUser).toHaveBeenCalledTimes(1)
			expect(notFoundUser.data).toBeTypeOf('string')
			expect(notFoundUser.data).toBe('User not found')
		})

		it('should throw an Error if repo throws an error', async () => {
			const foundUserError = async () =>
				await testUserCases.getOneUser({
					data: { field: '_invalid_field_', criteria: 11 },
				})

			await expect(foundUserError).rejects.toThrow()
			expect(testUserCases.getOneUser).toHaveBeenCalledTimes(1)
		})
	})

	// getManyUsers()
	describe('getManyUsers()', () => {
		afterEach(() => {
			vi.clearAllMocks()
		})

		it('should return a list of found users matching certain criteria', async () => {
			const foundUsers = await testUserCases.getManyUsers({
				data: {
					field: 'lastName',
					criteria: new User({ lastName: 'Doe' }).lastName,
				},
			})

			expect(testUserCases.getManyUsers).toHaveBeenCalledTimes(1)
			expect(foundUsers.data).toBeTypeOf('object')
			expect(foundUsers.data.length).toBeGreaterThan(0)
			foundUsers.data.forEach((user: User) => {
				expect(user).toBeInstanceOf(User)
				expect(user.password).toBe(null)
			})
		})

		it('should return a list of at least one user if at least one user was found', async () => {
			const foundUsers = await testUserCases.getManyUsers({
				data: {
					field: 'username',
					criteria: new User({ username: 'someUser123' }).username,
				},
			})

			expect(testUserCases.getManyUsers).toHaveBeenCalledTimes(1)
			expect(foundUsers.data).toBeTypeOf('object')
			expect(foundUsers.data.length).toBeGreaterThan(0)
			expect(foundUsers.data.length).toBe(1)
			foundUsers.data.forEach((user: User) => {
				expect(user).toBeInstanceOf(User)
				expect(user.password).toBe(null)
			})
		})

		it('should return {data: "No users found"} if no user were found matching a certain criteria', async () => {
			const noFoundUsers = await testUserCases.getManyUsers({
				data: {
					field: 'username',
					criteria: new User({ username: '_nonexistence_' }).username,
				},
			})

			expect(testUserCases.getManyUsers).toHaveBeenCalledTimes(1)
			expect(noFoundUsers).toBeTypeOf('object')
			expect(noFoundUsers.data).toBeTypeOf('string')
			expect(noFoundUsers.data).toBe('No users found')
		})
	})

	// createNewUser()
	describe('createNewUser()', () => {
		afterEach(() => {
			vi.clearAllMocks()
		})
		it('should return a created user when called with valid information', async () => {
			const testData = {
				username: '__New.User_-',
				password: 'secret@##72983e',
				firstName: 'Whatever',
				lastName: 'Dontcare',
				email: 'some@gmail.com',
			}
			const createdUser = await testUserCases.createNewUser({
				data: {
					...testData,
				},
			})

			expect(testUserCases.createNewUser).toHaveBeenCalledTimes(1)
			expect(createdUser.data).toBeInstanceOf(User)
			expect(createdUser.data.username).toBe(testData.username)
			expect(createdUser.data.password).toBe(null)
			expect(createdUser.data.firstName).toBe(testData.firstName)
			expect(createdUser.data.lastName).toBe(testData.lastName)
			expect(createdUser.data.email).toBe(testData.email)
			expect(createdUser.data.dateJoined).toBeTruthy()
			expect(createdUser.data.lastLogin).toBeTruthy()
		})

		it('should throw an error if the repo encountered an error', async () => {
			const notCreatedInstance1 = async () =>
				await testUserCases.createNewUser({ data: {} })
			const notCreatedInstance2 = async () =>
				await testUserCases.createNewUser({
					data: { username: '_some_invalid_username_' },
				})

			await expect(notCreatedInstance1).rejects.toThrow()
			await expect(notCreatedInstance2).rejects.toThrow()
		})
	})
	// updateUser()
	describe('updateUser()', () => {
		it('should update and return a user given valid information', async () => {
			const updatedUser = await testUserCases.updateUser({
				data: {
					id: 35,
					username: 'updatedUsername',
					lastName: 'updatedLastname',
				},
			})

			expect(testUserCases.updateUser).toHaveBeenCalledTimes(1)
			expect(updatedUser.data).toBeInstanceOf(User)
			expect(updatedUser.data.id).toBe(35)
			expect(updatedUser.data.username).toBe('updatedUsername')
			expect(updatedUser.data.lastName).toBe('updatedLastname')
			expect(updatedUser.data.password).toBeUndefined()
		})

		it('should throw an error if the repo encountered an error', async () => {
			const notUpdatedInstance1 = async () =>
				await testUserCases.updateUser({ data: {} })
			const notUpdatedInstance2 = async () =>
				await testUserCases.updateUser({
					data: { username: '_invalid_data_' },
				})

			await expect(notUpdatedInstance1).rejects.toThrow()
			await expect(notUpdatedInstance2).rejects.toThrow()
		})
	})
	// deleteUser()
	describe('deleteUser()', () => {
		it('should return "User deleted successfully" if there was no error', async () => {
			const deletedUser = await testUserCases.deleteUser({
				data: { field: 'id', criteria: 35 },
			})

			expect(deletedUser.data).toBe('User deleted successfully')
		})

		it('should throw error if repo encountered an error', async () => {
			const deletedUser = async () =>
				await testUserCases.deleteUser({
					data: { field: 'id', criteria: 11 },
				})

			await expect(deletedUser).rejects.toThrow()
		})
	})
})
