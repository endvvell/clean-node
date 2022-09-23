import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { DTOIn } from '../../../core/abstracts/DTOs/generic-dto.abstract'
import {
	Entity,
	IGenericRepo,
} from '../../../core/abstracts/repos/generic-repo.abstract'
import { nowTime } from '../../../core/helpers'
import { BCRYPT_WORK_FACTOR } from '../../../config/ENV_global'
import { RepoError } from '../../../core/abstracts/errors/RepoError'
import { logger } from '../../../logger/prodLogger'

type IgnorePrismaBuiltins<S extends string> = string extends S
	? string
	: S extends ''
	? S
	: S extends `$${infer T}`
	? never
	: S

export type PrismaModelName = IgnorePrismaBuiltins<keyof PrismaClient>

export abstract class PostgresGenericRepo
	implements IGenericRepo<Entity, DTOIn<Entity>>
{
	constructor(
		protected prismaClient: PrismaClient,
		protected prismaTableName: PrismaModelName,
		protected entityClass: new (...arg: any) => Entity,
	) {}

	checkIdIsValid(criteriaObj: any): boolean {
		let theId: string = criteriaObj.data.params.criteria
		if (!theId) {
			theId = criteriaObj.data.body.criteria
		}

		try {
			if (typeof +theId === 'number' && !isNaN(+theId)) {
				return true
			} else {
				return false
			}
		} catch (error) {
			logger.error(
				`Error while checking if ID is valid for ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async exists(criteriaObj: any): Promise<boolean> {
		try {
			if (criteriaObj.data.field === 'id') {
				criteriaObj.data.criteria = BigInt(
					Number(criteriaObj.data.criteria),
				)
			}
			let foundData
			if (this.prismaTableName === 'users') {
				foundData = await this.prismaClient[this.prismaTableName].count(
					{
						where: {
							[criteriaObj.data.field]: criteriaObj.data.criteria,
						},
					},
				)
			} // else if (posts...)
			else {
				throw new RepoError({ message: 'Invalid prisma table name' })
			}
			if (foundData && foundData > 0) {
				return true
			} else {
				return false
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while checking if entry exists in ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	formattedError(error: Error | any): any {
		let errorResult: { [key: string]: string } = {}

		switch (error.code) {
			case 'P2002':
				errorResult[error.meta.target[0]] = 'Duplicate value'
				break
			default:
				errorResult['ServerError'] = 'Error while processing data'
				break
		}

		return errorResult
	}

	async getMany(criteriaObj: DTOIn<Entity>): Promise<Entity[]> {
		const resultArray: Entity[] = []
		if (criteriaObj.data.field === 'id') {
			criteriaObj.data.criteria = BigInt(
				Number(criteriaObj.data.criteria),
			)
		}
		try {
			let foundData
			if (this.prismaTableName === 'users') {
				foundData = await this.prismaClient[
					this.prismaTableName
				].findMany({
					take: 10,
				})
			} // else if (posts...)
			else {
				throw new RepoError({ message: 'Invalid prisma table name' })
			}

			if (foundData.length > 0) {
				foundData.forEach((entry) => {
					const entryToPush = new this.entityClass({
						...entry,
						id: entry.id.toString(),
						password: null,
					})
					delete entryToPush.password
					resultArray.push(entryToPush)
				})
				return resultArray
			} else {
				resultArray.push(
					new this.entityClass({
						id: `no ${this.prismaTableName} found`,
					}),
				)
				return resultArray
			}
		} catch (error) {
			logger.error(
				`Error while getting many entries from ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async getOne(criteriaObj: DTOIn<Entity>): Promise<Entity> {
		if (criteriaObj.data.field === 'id') {
			criteriaObj.data.criteria = BigInt(
				Number(criteriaObj.data.criteria),
			)
		}

		if (!criteriaObj.data.hasOwnProperty('field')) {
			criteriaObj.data.field = 'id'
			criteriaObj.data.criteria = BigInt(Number(criteriaObj.data.id))
		}

		try {
			let foundObj
			if (this.prismaTableName === 'users') {
				foundObj = await this.prismaClient[
					this.prismaTableName
				].findFirst({
					where: {
						[criteriaObj.data.field]: criteriaObj.data.criteria,
					},
				})
			}
			if (!foundObj) {
				return new this.entityClass({
					id: `${this.prismaTableName} not found`,
				})
			} else {
				return new this.entityClass({
					...foundObj,
					id: foundObj.id.toString(),
					password: null,
				})
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while getting one entry from ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}
	async create(dataObj: DTOIn<Entity>): Promise<Entity> {
		delete dataObj.data.id

		try {
			if (dataObj.data.password) {
				dataObj.data.password = await hash(
					dataObj.data.password,
					BCRYPT_WORK_FACTOR,
				)
			}

			let newDataObj
			if (this.prismaTableName === 'users') {
				const createdObj = await this.prismaClient[
					this.prismaTableName
				].create({
					data: {
						...dataObj.data,
						dateJoined: new Date(nowTime()),
						lastLogin: new Date(nowTime()),
					},
				})

				newDataObj = new this.entityClass({
					...createdObj,
					password: null,
				})

				return newDataObj
			} else {
				throw new RepoError({ message: 'Invalid prisma table name' })
			} // else if (posts...) {}
		} catch (error: Error | any) {
			logger.error(
				`Error while creating an entry in ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async update(dataObj: DTOIn<Entity>): Promise<Entity> {
		try {
			if (dataObj.data.password) {
				dataObj.data.password = await hash(
					dataObj.data.password,
					BCRYPT_WORK_FACTOR,
				)
			} else {
				dataObj.data.password = undefined
			}

			let updatedData
			if (this.prismaTableName === 'users') {
				dataObj.data.id = BigInt(Number(dataObj.data.id))
				updatedData = await this.prismaClient[
					this.prismaTableName
				].update({
					where: {
						id: dataObj.data.id,
					},
					data: {
						...dataObj.data,
					},
				})
			} // else if ('posts'...) {}

			if (this.prismaTableName === 'users' && updatedData) {
				const newDataObj = new this.entityClass({
					...updatedData,
					password: null,
				})
				return newDataObj
			} else {
				// else if ('posts' && updatedData) {}
				return new this.entityClass({
					id: `${this.prismaTableName} not found`,
				})
			}
		} catch (error: Error | any) {
			logger.error(
				`Error while updating an entry in ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}

	async delete(criteriaObj: DTOIn<Entity>): Promise<void> {
		try {
			if (this.prismaTableName === 'users') {
				const deletedObj = await this.prismaClient[
					this.prismaTableName
				].delete({
					where: {
						id: BigInt(Number(criteriaObj.data.id)),
					},
				})
			}
		} catch (error) {
			logger.error(
				`Error while deleting an entry in ${this.prismaTableName} table: ${error}`,
			)
			throw this.formattedError(error)
		}
	}
}
