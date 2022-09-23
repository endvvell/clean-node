import { NextFunction, Request, Response } from 'express'
import { repoInUse } from '../user.router'

export const checkUniqueEmail = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		if (req.body.email) {
			const foundUser = await repoInUse.getOne({
				data: {
					field: 'email',
					criteria: req.params.email || req.body.email,
				},
			})
			if (String(foundUser.id) !== 'users not found') {
				if (String(foundUser.id) === req.params.id) {
					next()
				} else {
					res.status(400).json({
						status: 'failed',
						reason: 'Email is already in use',
					})
				}
			} else {
				next()
			}
		} else {
			next()
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
