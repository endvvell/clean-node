export const {
    POSTGRES_USERNAME = 'new_user',
    POSTGRES_PASSWORD = '123',
    POSTGRES_HOST = 'localhost',
    POSTGRES_PORT = 5432,
    POSTGRES_DATABASE = 'newDB',
    POSTGRES_INITDB_ROOT_USERNAME = 'root',
    POSTGRES_URI = `POSTGRESdb://${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}?authSource=admin`,
} = process.env

// postgresql://USER:PASSWORD@HOST:PORT/DATABASE

// the variables in this file aren't actually used since Prisma use only those in .env file in the root of the project, but I'll leave them be in case I ever decide to use 