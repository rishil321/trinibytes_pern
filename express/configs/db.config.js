module.exports = {
    HOST: "postgres",
    USER: "postgres",
    PASSWORD: "postgres",
    DB: "trinibytes_db",
    dialect: "postgres",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 60000
    }
};