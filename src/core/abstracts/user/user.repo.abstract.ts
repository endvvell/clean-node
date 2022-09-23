import { User } from '../../entities/user.entity'
import { IGenericRepo } from '../repos/generic-repo.abstract'
import { UserDTOIn } from './user.dto.abstract'

// replace the "any" of "CreateObj" with "middlewareObj" type
export abstract class UserRepo implements IGenericRepo<User, UserDTOIn> {
	abstract formattedError(error: any): any
	abstract exists(criteriaObj: any): Promise<boolean>
	abstract getMany(criteriaObj: UserDTOIn): Promise<User[]> // [{username: "no users found"}]
	abstract getOne(criteriaObj: UserDTOIn): Promise<User> // Entity: {username: "user not found"}
	abstract create(dataObj: UserDTOIn): Promise<User> // Mongo throws error if failed to create
	abstract update(dataObj: UserDTOIn): Promise<User> // Mongo throws error if failed to update
	abstract delete(criteriaObj: UserDTOIn): Promise<void> // Entity: {username: "successfully deleted"}

	// ...specify additional user-related repo methods if needed
}
