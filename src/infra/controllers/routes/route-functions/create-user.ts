import { NextFunction, Request, Response } from "express"
import { User } from "../../../../core/entities/user.entity"
import { userControllers } from "../user.router"

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const createdUser = await userControllers.createUser(
			new User({ ...req.body }),
		)

		if (createdUser.data.password) delete createdUser.data.password

		return res.status(201).json({
			status: 'success',
			data: {
				...createdUser.data,
				id: createdUser.data.id.toString(),
			},
		})
	} catch (error: Error | any) {
		next(error)
	}
}