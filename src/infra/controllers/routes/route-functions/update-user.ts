import { NextFunction, Request, Response } from "express"
import { User } from "../../../../core/entities/user.entity"
import { userControllers } from "../user.router"

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {

	if (!res.locals.userExists) {
		return res
			.status(404)
			.json({ status: 'failed', reason: 'User not found' })
	}

	try {
		const updatedUser = await userControllers.updateUser(
			new User({ ...req.body, id: req.params.id || req.body.id }),
		)

		if (updatedUser.data.password) delete updatedUser.data.password

		return res.status(200).json({
			status: 'success',
			data: {
				...updatedUser.data,
				id: updatedUser.data.id.toString(),
			},
		})
	} catch (error: Error | any) {
		next(error)
	}
}