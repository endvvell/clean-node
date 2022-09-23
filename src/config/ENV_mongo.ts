export const {
    MONGO_USERNAME = 'admin',
    MONGO_PASSWORD = 'secret',
    MONGO_HOST = 'localhost',
    MONGO_PORT = 27017,
    MONGO_DATABASE = 'newDB',
    MONGO_INITDB_ROOT_USERNAME = 'root',
    MONGO_URI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`,
} = process.env

