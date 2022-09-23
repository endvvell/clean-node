import { UserRepo } from '../../../../core/abstracts/user/user.repo.abstract'
import { IUser, userMongoModel } from '../models/user.mongo-model'
import { MongoGenericRepo } from '../mongo-generic-repo'
import { User } from '../../../../core/entities/user.entity'

export class UserMongoRepo extends MongoGenericRepo<IUser> implements UserRepo {
	constructor() {
		super(userMongoModel, User)
	}

	// login

	// logout
}
