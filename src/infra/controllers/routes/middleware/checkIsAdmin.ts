import { Request, Response } from 'express'

export const checkIsAdmin = (req: Request, res: Response) => {
	// if the cookie sent along with the request proves that the sender is an admin then check for "isAdmin" prop in the req.body,
	// if (found & confirmed that the sender is an admin) { leave request as is, pass it on }
	// else {reject with 403}
}
