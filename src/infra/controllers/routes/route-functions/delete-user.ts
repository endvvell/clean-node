import { NextFunction, Request, Response } from 'express'
import { userControllers } from '../user.router'

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {

    if (!res.locals.userExists) {
        return res.status(404).json({status: 'failed', reason: 'User not found'})
    }
	try {
		const deletedUser = await userControllers.deleteUser({
			data: {
				id: req.params.id || req.body.id,
			},
		})
		return res.status(200).json({ status: 'success', data: deletedUser.data })
	} catch (error) {
		next(error)
	}
}
