import { User } from '../../entities/user.entity'
import { DTOOut, DTOIn } from '../DTOs/generic-dto.abstract'

export abstract class UserDTOIn implements DTOIn<User> {
	constructor(public data: Partial<User> | any) {}
	field?: string | null | undefined
	criteria?: any
}

export abstract class UserDTOOut implements DTOOut<User> {
	data: boolean | User | undefined | any
}
