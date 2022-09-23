import { NextFunction, Request, Response } from 'express'
import { repoInUse } from '../user.router'

export const checkUniqueUsername = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const foundUser = await repoInUse.getOne({
			data: {
				field: 'username',
				criteria: req.params.username || req.body.username,
			},
		})
		if (String(foundUser.id) === 'users not found') {
			next()
		} else {
			if (String(foundUser.id) === req.params.id) {
				next()
			} else {
				res.status(403).json({
					status: 'failed',
					reason: 'Username is taken',
				})
			}
		}
	} catch (error) {
		return res
			.status(500)
			.json({
				status: 'failed',
				reason: 'Error while processing request',
			})
	}
}
