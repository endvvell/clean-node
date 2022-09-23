export const {
    NODE_ENV = 'dev',
    HTTP_PORT = 3000,
    DATABASE_IN_USE = 'mongodb', // 'mongodb' || 'postgres'
} = process.env

export const IN_PROD = (NODE_ENV === 'prod')

export const BCRYPT_WORK_FACTOR = 12