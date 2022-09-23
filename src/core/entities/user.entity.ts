import { checkEmpty } from '../helpers'
import { UserEntity } from '../abstracts/user/user.entity.abstract'
import { InvalidInputError } from '../abstracts/errors/InvalidInputError'

export class User implements UserEntity {
	public id?: string | null = null
	public username?: string | null = null
	public password?: string | null = null
	public firstName?: string | null = null
	public lastName?: string | null = null
	public lastLogin?: string | null
	public dateJoined?: string | null
	public isAdmin?: boolean = false
	public isActive?: boolean = true
	public telegramLink?: string | null = null
	public email?: string | null = null
	public preferredName?: string | null = null

	constructor({
		...userObj
	}: {
		id?: string
		username?: string
		password?: string
		firstName?: string
		lastName?: string
		lastLogin?: string
		dateJoined?: string
		isAdmin?: boolean
		isActive?: boolean
		telegramLink?: string
		email?: string
		preferredName?: string
	}) {
		if (userObj.id) {
			this.id = userObj.id
		}
		if (userObj.username) {
			this.username = this.validUsername(userObj.username)
			this.preferredName = this.username
		}
		if (userObj.password) {
			this.password = this.validPassword(userObj.password)
		}
		if (userObj.firstName) {
			this.firstName = this.validFirstName(userObj.firstName)
		}
		if (userObj.lastName) {
			this.lastName = this.validLastName(userObj.lastName)
		}
		if (userObj.lastLogin) {
			this.lastLogin = userObj.lastLogin // check if the date isn't in the future, and only admins should be able to send this field in JSON
		}
		if (userObj.dateJoined) {
			this.dateJoined = userObj.dateJoined // check if the date isn't in the future, and only admins should be able to send this field in JSON
		}
		// Add this once admin functionality is implemented:
		// if (userObj.isAdmin) {
		// 	this.isAdmin = this.validIsAdmin(userObj.isAdmin) // check that the sender is an admin
		// }
		// if (userObj.isActive) {
		// 	this.isActive = this.validIsActive(userObj.isActive) // check that the sender is an admin
		// }
		if (userObj.telegramLink) {
			this.telegramLink = this.validTelegramLink(userObj.telegramLink)
		}
		if (userObj.email) {
			this.email = this.validEmail(userObj.email)
		}
	}

	validUsername(username: string) {
		const pattern = /^[\p{sc=Latn}\p{Nd}_.-]*$/u.test(username)
		if (
			!checkEmpty(username) ||
			username.trim().length < 3 ||
			username.trim().length > 32 ||
			!pattern
		) {
			throw new InvalidInputError({
				message:
					'Invalid username: must be at least 3 alphanumeric characters long - underscores(_), dots(.), and dashes(-) are allowed',
			})
		} else {
			return username
		}
	}

	validPassword(password: string) {
		const pattern = /^(?=.*[!@#$%^&*.])(?=.*[A-z]).*$/u.test(password)

		if (
			!checkEmpty(password) ||
			password.trim().length < 8 ||
			password.trim().length > 50 ||
			!pattern
		) {
			throw new InvalidInputError({
				message:
					'Invalid password: must consist of at least 8 alphanumeric characters including 1 special character',
			})
		} else {
			return password
		}
	}

	validFirstName(value: string) {
		if (!checkEmpty(value) || value.trim().length > 100) {
			throw new InvalidInputError({
				message: 'Invalid value for the "first name" provided',
			})
		} else {
			return value
		}
	}

	validLastName(value: string) {
		if (!checkEmpty(value) || value.trim().length > 100) {
			throw new InvalidInputError({
				message: 'Invalid value for the "last name" provided',
			})
		} else {
			return value
		}
	}

	// Add this later for admin functionality:
	// validIsAdmin(value: boolean) {
	// 	if (typeof value !== 'boolean') {
	// 		throw new InvalidInputError({
	// 			message: "Invalid 'isAdmin' value provided",
	// 		})
	// 	} else {
	// 		return (this.isAdmin = value)
	// 	}
	// }
	// validIsActive(value: boolean) {
	// 	if (typeof value !== 'boolean') {
	// 		throw new InvalidInputError({
	// 			message: "Invalid 'isActive' value provided",
	// 		})
	// 	} else {
	// 		return (this.isActive = value)
	// 	}
	// }

	validTelegramLink(value: string) {
		let indexOfId = value.lastIndexOf('/')
		let str1 = value.substring(0, indexOfId + 1),
			str2 = value.substring(indexOfId + 1)

		const pattern = /^[\p{sc=Latn}\p{Nd}_]*$/u.test(str2)

		if (
			!checkEmpty(value) ||
			value.trim().length > 45 ||
			value.trim().length < 18 ||
			!pattern ||
			str1 !== 'https://t.me/'
		) {
			throw new InvalidInputError({
				message: 'Invalid telegram link provided',
			})
		} else {
			return value
		}
	}

	validEmail(value: string) {
		const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,}$/u.test(
			value,
		)
		if (
			!checkEmpty(value) ||
			value.trim().length > 70 ||
			value.trim().length < 5 ||
			!pattern
		) {
			throw new InvalidInputError({ message: 'Invalid email provided' })
		} else {
			return value
		}
	}
}
