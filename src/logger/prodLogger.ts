import winston from 'winston'

export const buildLogger = () => {
	const logger = winston.createLogger({
		level: 'http',
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.errors({
				stack: true,
			}),
			winston.format.prettyPrint(),
			winston.format.json(),
		),
		// defaultMeta: {someKey: 'someFutureValue'},
		transports: [
			new winston.transports.File({
				filename: './errors.log',
				level: 'error',
			}),
			new winston.transports.File({
				filename: './combined.log',
				level: 'info',
			}),
			new winston.transports.Console(),
		],
	})

	return logger
}


// LOGGER
export const logger = buildLogger()