import { NextFunction, Request, Response } from 'express'
import { repoInUse } from '../user.router'

export const foundUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userExists = await repoInUse.exists({
			data: {
				field: 'id',
				criteria: req.params.id || req.body.id,
			},
		})
		res.locals.userExists = userExists
		next()
	} catch (error) {
		return res.status(500).json({
			status: 'failed',
			reason: 'Error while processing request',
		})
	}
}
