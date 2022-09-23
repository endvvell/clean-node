import { DTOOut } from '../../core/abstracts/DTOs/generic-dto.abstract'
import { User } from '../../core/entities/user.entity'
import { UserUseCases } from '../../core/use-cases/user.use-cases'

export class UserController {
	constructor(private userUseCases: UserUseCases) {}

	async getUser(userInfo: User): Promise<DTOOut<User>> {
		const foundUser = await this.userUseCases.getOneUser({
			data: {
				...userInfo,
				field: userInfo.id ? 'id' : userInfo.username && 'username',
				criteria: userInfo.id || userInfo.username,
			},
		})
		if (foundUser.data.hasOwnProperty('password'))
			delete foundUser.data.password

		return foundUser
	}

	async getManyUsers(userInfo: User): Promise<DTOOut<User>> {
		const foundUsers = await this.userUseCases.getManyUsers({
			data: userInfo,
		})

		return foundUsers
	}

	async createUser(userInfo: User): Promise<DTOOut<User>> {
		const createdUser = await this.userUseCases.createNewUser({
			data: userInfo,
		})
		if (createdUser.data.hasOwnProperty('password'))
			delete createdUser.data.password
		return createdUser
	}

	async updateUser(userInfo: User): Promise<DTOOut<User>> {
		const updatedUser = await this.userUseCases.updateUser({
			data: userInfo,
		})
		if (updatedUser.data.hasOwnProperty('password'))
			delete updatedUser.data.password
		return updatedUser
	}

	async deleteUser(userInfo: {
		data: { id: string }
	}): Promise<DTOOut<User>> {
		const deletedObj = await this.userUseCases.deleteUser(userInfo)

		return deletedObj
	}
}
