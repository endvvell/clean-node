import { NextFunction, Request, Response } from "express"
import { User } from "../../../../core/entities/user.entity"
import { userControllers } from "../user.router"

export const getOneUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {

    if (!res.locals.userExists) {
        return res.status(404).json({status: 'failed', reason: 'User not found'})
    }
	try {
		const foundUser = await userControllers.getUser(
			new User({ id: req.params.id || req.body.id }),
		)

		if (foundUser.data.hasOwnProperty('password')) delete foundUser.data.password
        
        
		return res.status(200).json({
			status: 'success',
			data: {
				...foundUser.data,
				id: foundUser.data.id.toString(),
			},
		})
	} catch (error: Error | any) {
		next(error)
	}
}