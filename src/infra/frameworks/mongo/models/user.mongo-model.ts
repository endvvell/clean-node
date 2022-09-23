import mongoose, { Document, Schema } from 'mongoose'
import { nowTime } from '../../../../core/helpers'
import { compare, hash } from 'bcryptjs'
import { BCRYPT_WORK_FACTOR } from '../../../../config/ENV_global'

export interface IUser extends Document {
	id?: string
	username: string
	password: string
	firstName?: string
	lastName?: string
	lastLogin?: string
	dateJoined?: string
	isAdmin?: boolean
	isActive?: boolean
	telegramLink?: string
	email?: string
	preferredName?: string
	matchesPassword: (password: string) => Promise<boolean>
}

export const userMongoSchema = new Schema<IUser>({
	username: {
		type: String,
		required: [true, 'Username is required'],
		unique: true,
		trim: true,
		maxlength: [32, 'Username must not be longer than 32 characters'],
		minlength: [3, 'Username must be longer than 3 characters'],
		validate: {
			validator: (username: string) => {
				const pattern = /^[\p{sc=Latn}\p{Nd}_.-]*$/u
				return pattern.test(username)
			},
			message:
				'Invalid value for username provided: must be at least 3 alphanumeric characters long - underscores, dots, and dashes are allowed',
		},
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		validate: {
			validator: (password: string) => {
				const pattern = /^(?=.*[!@#$%^&*.])(?=.*[A-z]).*$/u
				return pattern.test(password)
			},
			message: 'Incomplete password',
		},
		maxlength: [80, 'Password must not be longer than 80 characters'],
		minlength: [8, 'Password must be longer than 8 characters'],
	},
	firstName: {
		type: String,
		trim: true,
		default: null,
		maxlength: [100, 'First name must not be longer than 100 characters'],
	},
	lastName: {
		type: String,
		trim: true,
		default: null,
		maxlength: [100, 'Last name must not be longer than 100 characters'],
	},
	lastLogin: {
		type: Date,
		default: nowTime(),
	},
	dateJoined: {
		type: Date,
		default: nowTime(),
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	isActive: {
		type: Boolean,
		default: false,
	},
	telegramLink: {
		type: String,
		default: null,
		trim: true,
		maxlength: [45, 'Telegram link must not be longer than 45 characters'],
		minlength: [18, 'Telegram link must be at least 18 characters long'],
		validate: {
			validator: (value: string) => {
				if (value) {
					const pattern = /^[\p{sc=Latn}\p{Nd}_]*$/u
					return pattern.test(value)
				} else {
					return true
				}
			},
			message: 'Invalid telegram link provided',
		},
	},
	email: {
		type: String,
		default: null,
		trim: true,
		maxlength: [70, 'Email must not be longer than 70 characters'],
		minlength: [5, 'Email must be at least 5 characters long'],
		validate: {
			validator: (value: string) => {
				if (value) {
					const pattern =
						/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z]{2,}$/u
					return pattern.test(value)
				} else {
					return true
				}
			},
			message: 'Invalid email provided',
		},
		// the uniqueness check is handled in the express middleware for each use case
	},
	preferredName: {
		type: String,
		default: null,
		trim: true,
		maxlength: [
			200,
			'Preferred name must not be longer than 70 characters',
		],
		minlength: [5, 'Preferred name must be at least 5 characters long'],
		validate: {
			validator: (value: string) => {
				const pattern = /^[\p{sc=Latn}\p{Nd}_.-]*$/u
				return pattern.test(value)
			},
			message:
				"Invalid value for 'preferred name' provided: must be more than 5 alphanumeric characters - underscores, dots, and dashes are allowed",
		},
	},
})

userMongoSchema.pre<IUser>('save', async function () {
	if (this.isModified('password')) {
		this.password = await hash(this.password, BCRYPT_WORK_FACTOR)
	}
})

userMongoSchema.methods.matchesPassword = async function (password: string) {
	const passwordMatch = await compare(password, this.password)
	return passwordMatch
}

export const userMongoModel = mongoose.model<IUser>('User', userMongoSchema)
