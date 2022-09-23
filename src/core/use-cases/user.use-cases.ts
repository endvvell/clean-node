import { logger } from '../../logger/prodLogger'
import { DTOIn, DTOOut } from '../abstracts/DTOs/generic-dto.abstract'
import { RepoError } from '../abstracts/errors/RepoError'
import { UserDTOOut } from '../abstracts/user/user.dto.abstract'
import { UserRepo } from '../abstracts/user/user.repo.abstract'
import { User } from '../entities/user.entity'

export class UserUseCases {
	constructor(private userRepo: UserRepo) {}

	async getOneUser(DTOIn: DTOIn<User>): Promise<DTOOut<User>> {
		const outDto: UserDTOOut = { data: {} }

		try {
			const foundUser = await this.userRepo.getOne(DTOIn)
			if (foundUser.id === 'users not found') {
				outDto.data = 'User not found'
				return outDto
			} else {
				outDto.data = foundUser
				return outDto
			}
		} catch (error: Error | any) {
			logger.error(`Error while getting a user (use case): ${error}`)
			throw new RepoError({ error })
		}
	}

	async getManyUsers(DTOIn: DTOIn<User>): Promise<DTOOut<User>> {
		const outDto: UserDTOOut = { data: {} }
		try {
			const foundUsers = await this.userRepo.getMany(DTOIn)
			if (foundUsers[0].id === 'no users found') {
				outDto.data = 'No users found'
				return outDto
			} else {
				outDto.data = foundUsers
				return outDto
			}
		} catch (error: Error | any) {
			logger.error(`Error while getting many users (use case): ${error}`)
			throw new RepoError({ error })
		}
	}

	async createNewUser(DTOIn: DTOIn<User>): Promise<DTOOut<User>> {
		const outDto: UserDTOOut = { data: {} }
		try {
			const createdUser = await this.userRepo.create(DTOIn)
			outDto.data = createdUser
			return outDto
		} catch (error: Error | any) {
			logger.error(`Error while creating new user (use case): ${error}`)
			throw new RepoError({ error })
		}
	}

	async updateUser(DTOIn: DTOIn<User>): Promise<DTOOut<User>> {
		const outDto: UserDTOOut = { data: {} }
		try {
			const updatedUser = await this.userRepo.update(DTOIn)
			outDto.data = updatedUser
			return outDto
		} catch (error: Error | any) {
			logger.error(`Error while updating a user (use case): ${error}`)
			throw new RepoError({ error })
		}
	}

	async deleteUser(DTOIn: DTOIn<User>): Promise<DTOOut<User>> {
		const outDto: UserDTOOut = { data: {} }
		try {
			await this.userRepo.delete(DTOIn)
			outDto.data = 'User deleted successfully'
			return outDto
		} catch (error: Error | any) {
			logger.error(`Error while deleting a user (use case): ${error}`)
			throw new RepoError({ error })
		}
	}
}
