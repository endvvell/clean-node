import e, { NextFunction, Request, Response } from 'express'
import { InvalidInputError } from './core/abstracts/errors/InvalidInputError'
import { RepoError } from './core/abstracts/errors/RepoError'
import { usersRouter } from './infra/controllers/routes/user.router'

export const createApp = () => {
	const app = e()

	// MIDDLEWARE
	app.use(e.urlencoded({ extended: true }))
	app.use(e.json())

	// JSON input error handler
	app.use(
		(
			error: Error | any,
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			if (error.status === 400)
				return res
					.status(error.status)
					.json({ status: 'failed', reason: 'Invalid JSON' })

			next()
		},
	)

	// ROUTERS
	app.use('/api/users', usersRouter)

	// ROUTERS ERROR HANDLER
	app.use(
		(
			error: Error | any,
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			switch (error.constructor) {
				case InvalidInputError:
					return res.status(400).json({
						status: 'failed',
						reason: error.message,
					})
				case RepoError:
					if (error.error.server_error) {
						return res.status(500).json({
							status: 'failed',
							reason: 'Error while processing data',
						})
					}
					return res.status(400).json({
						status: 'failed',
						reason: error.error,
					})
				default:
					return res.status(500).json({
						status: 'failed',
						reason: 'Request failed due to a server error',
					})
			}
		},
	)

	// 404 - IN CASE NOT FOUND
	app.all('*', (req, res) => {
		return res.status(404).send('404 - page not found')
	})

	return app
}
