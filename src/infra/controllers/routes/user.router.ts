import e from 'express'
import { getManyUsers } from './route-functions/get-many-users'
import { UserController } from '../user.controllers'
import { UserUseCases } from '../../../core/use-cases/user.use-cases'
import { UserMongoRepo } from '../../frameworks/mongo/usecase-repos/mongo-user-repo'
import { checkIdIsValid } from './middleware/checkIdIsValid'
import { foundUser } from './middleware/foundUser'
import { methodNotAllowed } from './middleware/methodNotAllowed'
import { checkUniqueEmail } from './middleware/checkUniqueEmail'
import { checkUniqueUsername } from './middleware/checkUniqueUsername'
import { DATABASE_IN_USE } from '../../../config/ENV_global'
import { UserRepo } from '../../../core/abstracts/user/user.repo.abstract'
import { UserPostgreRepo } from '../../frameworks/prisma-postgres/usecase-repos/user-postgres-repo'
import { checkCreateUserInfo } from './middleware/checkCreateUserInfo'
import { deleteUser } from './route-functions/delete-user'
import { updateUser } from './route-functions/update-user'
import { getOneUser } from './route-functions/get-one-user'
import { createUser } from './route-functions/create-user'

export const usersRouter = e.Router()

export let repoInUse: UserRepo
if (DATABASE_IN_USE === 'mongodb') {
	repoInUse = new UserMongoRepo()
} else {
	repoInUse = new UserPostgreRepo()
}

export const userControllers = new UserController(new UserUseCases(repoInUse))

usersRouter.route('/').get(getManyUsers).all(methodNotAllowed)
usersRouter
	.route('/create')
	.post(checkCreateUserInfo, createUser)
	.all(methodNotAllowed)
usersRouter
	.route('/:id')
	.get(checkIdIsValid, foundUser, getOneUser)
	.patch(
		foundUser,
		checkIdIsValid,
		checkUniqueUsername,
		checkUniqueEmail,
		updateUser,
	)
	.delete(checkIdIsValid, foundUser, deleteUser)
	.all(methodNotAllowed)
