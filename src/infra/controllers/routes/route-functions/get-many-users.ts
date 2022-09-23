import { NextFunction, Request, Response } from "express"
import { User } from "../../../../core/entities/user.entity"
import { userControllers } from "../user.router"

export const getManyUsers = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
    // edit later for custom criteria
	try {
		const foundUsers = await userControllers.getManyUsers(
			new User({}),
		)
		return res.status(200).json({ status: 'success', data: foundUsers.data })
	} catch (error: Error | any) {
		next(error)
	}
}