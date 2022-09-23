import { Model } from 'mongoose'
import {
	Entity,
	IGenericRepo,
} from '../../../core/abstracts/repos/generic-repo.abstract'
import { DTOIn } from '../../../core/abstracts/DTOs/generic-dto.abstract'
import { nowTime } from '../../../core/helpers'
import { RepoError } from '../../../core/abstracts/errors/RepoError'
import { logger } from '../../../logger/prodLogger'

export abstract class MongoGenericRepo<RepoDocument>
	implements IGenericRepo<Entity, DTOIn<Entity>>
{
	constructor(
		private mongoModel: Model<RepoDocument>,
		private entityClass: new (...arg: any) => Entity,
	) {}

	async exists(criteriaObj: any): Promise<boolean> {
		try {
			let foundData: any
			if (criteriaObj.data.field === 'id') {
				foundData = await this.mongoModel.exists({
					$or: [
						{ _id: criteriaObj.data.criteria },
						{ _id: criteriaObj.data.criteria },
					],
				})
			} else {
				foundData = await this.mongoModel.exists({
					$or: [
						{ [criteriaObj.data.field]: criteriaObj.data.criteria },
						{ [criteriaObj.data.field]: criteriaObj.data.criteria },
					],
				})
			}
			if (foundData) {
				return true
			} else {
				return false
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while checking if ID is valid for the "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	formattedError(error: Error | any): any {
		let errorResult: { [key: string]: string } | any = {}
		if (error.constructor.name === 'MongoNotConnectedError') {
			errorResult['server_error'] = 'Error while processing data'
		} else {
			Object.keys(error.errors).forEach((validationError) => {
				errorResult[validationError] =
					error.error[validationError].message
			})
		}

		return errorResult
	}

	async getMany(criteriaObj: DTOIn<Object>): Promise<Entity[]> {
		const resultArray: Entity[] = []
		try {
			const foundObj = await this.mongoModel.find({}).limit(10)
			if (foundObj.length > 0) {
				foundObj.forEach((entry) => {
					let objToPush
					if (this.mongoModel.collection.collectionName === 'users') {
						objToPush = new this.entityClass({
							...entry.toObject(),
							id: entry.toObject()._id,
							password: null,
						})
						delete objToPush.password
					} // else (posts...) {}
					else {
						throw new RepoError({
							message: 'Invalid mongo model name',
						})
					}
					resultArray.push(objToPush)
				})
				return resultArray
			} else {
				resultArray.push(
					new this.entityClass({
						id: `no ${this.mongoModel.collection.collectionName} found`,
					}),
				)
				return resultArray
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while getting many ${this.mongoModel.collection.collectionName} from "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async getOne(criteriaObj: DTOIn<Entity>): Promise<Entity> {
		if (
			!criteriaObj.data.hasOwnProperty('field') ||
			criteriaObj.data.field === 'id'
		) {
			criteriaObj.data.field = '_id'
			criteriaObj.data.criteria = criteriaObj.data.id
		}

		try {
			const foundObj = await this.mongoModel.findOne({
				[criteriaObj.data.field]: criteriaObj.data.criteria,
			})
			if (!foundObj) {
				return new this.entityClass({
					id: `${this.mongoModel.collection.collectionName} not found`,
				})
			} else {
				if (this.mongoModel.collection.collectionName === 'users') {
					return new this.entityClass({
						...foundObj.toObject(),
						id: foundObj.toObject()._id,
						password: null,
					})
				} // else {posts...}
				else {
					throw new RepoError({ message: 'Invalid mongo model name' })
				}
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while getting one ${this.mongoModel.collection.collectionName} from the "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async create(dataObj: DTOIn<Entity>): Promise<Entity> {
		try {
			if (this.mongoModel.collection.collectionName === 'users') {
				const createdObj = new this.mongoModel({
					...dataObj.data,
					dateJoined: nowTime(),
					lastLogin: nowTime(),
				})
				await createdObj.save()

				const newObj = new this.entityClass({
					...createdObj.toObject(),
					id: createdObj.toObject()._id,
					password: null,
				})

				return newObj
			} // else {posts...}
			else {
				throw new RepoError({ message: 'Invalid mongo model name' })
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while creating new entry in the "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async update(dataObj: DTOIn<Entity>): Promise<Entity> {
		try {
			if (this.mongoModel.collection.collectionName === 'users') {
				let updatedObj = await this.mongoModel.findByIdAndUpdate(
					{ _id: dataObj.data.id },
					{ ...dataObj.data },
					{ new: true }, // runValidators: true
				)

				if (updatedObj) {
					delete updatedObj.toObject().password
					const newUser = new this.entityClass({
						...updatedObj.toObject(),
						id: updatedObj.toObject()._id,
						password: null,
					})
					return newUser
				} // else {posts...}
				else {
					throw new RepoError({ message: 'Invalid mongo model name' })
				}
			} else {
				return new this.entityClass({
					id: `${this.mongoModel.collection.collectionName} not found`,
				})
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while updating an entry in the "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async delete(criteriaObj: DTOIn<Entity>): Promise<void> {
		try {
			const deletedObj = await this.mongoModel.deleteOne({
				_id: criteriaObj.data.id,
			})

			if (deletedObj.deletedCount > 0) {
				return
			} else {
				throw new RepoError({
					message: `Error while deleting an entry from ${this.mongoModel.collection.collectionName} table`,
				})
			}

			// might want to implement some sort of confirmation from the repo that the entry was deleted:
			// it works now anyway, but this just seems like a better solution than throwing an error if the user wasn't found, too bad I'm not feeling like it so see ya.
			// return new this.entityClass({ id: "successfully deleted" })
		} catch (error: Error | any) {
			logger.error(
				`Error while deleting an entry in the "${this.mongoModel.collection.collectionName}" table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}
}
