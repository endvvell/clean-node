#!/usr/bin/env node
import mongoose from 'mongoose'
import { createApp } from './app'
import { DATABASE_IN_USE, HTTP_PORT, NODE_ENV } from './config/ENV_global'
import { MONGO_URI } from './config/ENV_mongo'
import { PrismaClient } from '@prisma/client'
import { logger } from './logger/prodLogger'

;(async () => {
	// connecting to dbs
	logger.info(`Database in use: ${DATABASE_IN_USE}`)

	if (DATABASE_IN_USE === 'mongodb') {
		try {
			await mongoose.connect(MONGO_URI).then(() => {
				console.log('Connected to MongoDB successfully.')
			})
		} catch (error) {
			logger.error(`Error while connecting to MongoDB: ${error}`)
		}
	} else {
		try {
			const prisma = new PrismaClient()
			await prisma.$queryRaw`SELECT 1+1`
			console.log('Successfully connected to Postgres')
		} catch (error) {
			logger.error(`Error while connecting to Postgres: ${error}`)
		}
	}

	// creating an app
	const app = createApp()

	app.listen(HTTP_PORT, () => {
		console.log(`Listening on port ${HTTP_PORT}, running in ${NODE_ENV}`)
	}).on('error', (error) => {
		logger.error(`Error while starting up: ${error}`)
		process.exit()
	})
})()
