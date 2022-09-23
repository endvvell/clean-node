import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { DATABASE_IN_USE } from '../../../../config/ENV_global'

export const checkIdIsValid = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let theId: string = req.params.id || req.body.id

	try {
		if (DATABASE_IN_USE === 'mongodb') {
			if (mongoose.Types.ObjectId.isValid(theId)) {
				if (String(new mongoose.Types.ObjectId(theId)) === theId) {
					next()
				} else {
					res.status(400).json({
						status: 'failed',
						reason: 'Invalid ID',
					})
				}
			} else {
				res.status(400).json({ status: 'failed', reason: 'Invalid ID' })
			}
		} else {
			if (typeof +theId === 'number' && !isNaN(+theId)) {
				next()
			} else {
				res.status(400).json({ status: 'failed', reason: 'Invalid ID' })
			}
		}
	} catch (error) {
		res.status(500).json({
			status: 'failed',
			reason: 'Error while processing request',
		})
	}
}
