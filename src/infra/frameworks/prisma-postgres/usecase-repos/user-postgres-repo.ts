import { PrismaClient } from '@prisma/client'
import { UserRepo } from '../../../../core/abstracts/user/user.repo.abstract'
import { User } from '../../../../core/entities/user.entity'
import { PostgresGenericRepo } from '../generic-postgres-repo'

export class UserPostgreRepo extends PostgresGenericRepo implements UserRepo {
	constructor() {
		super(new PrismaClient(), 'users', User)
	}
	
	// login

	// logout
}
