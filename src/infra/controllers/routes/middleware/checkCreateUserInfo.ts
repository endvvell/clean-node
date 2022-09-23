import { NextFunction, Request, Response } from 'express'
import { repoInUse } from '../user.router'

export const checkCreateUserInfo = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.body.username) {
		return res
			.status(400)
			.json({
				status: 'failed',
				reason: 'Invalid input: username not provided',
			})
	}

	try {
		const checkUsernameTaken = await repoInUse.exists({
			data: {
				field: 'username',
				criteria: req.params.username || req.body.username,
			},
		})
		if (checkUsernameTaken) {
			return res
				.status(409)
				.json({ status: 'failed', reason: 'Username is taken' })
		}

		if (req.body.email) {
			const checkEmailTaken = await repoInUse.exists({
				data: {
					field: 'email',
					props: {
						criteria: req.body.email,
					},
				},
			})
			if (checkEmailTaken) {
				return res
					.status(409)
					.json({
						status: 'failed',
						reason: 'Email is already in use',
					})
			}
		}
		next()
	} catch (error: Error | any) {
		return res.status(400).json({ status: 'failed', reason: error })
	}
}
