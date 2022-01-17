import * as path from "path";
let dbConnectionObj;

if (process.env.NODE_ENV === "production") {
    dbConnectionObj = {
        "type": "postgres",
        "host":"postgres",
        "port": 5432,
        "username":"postgres",
        "password":"postgres",
        "database":"trinibytes_db",
        "migrationsRun":"True",
        "entities": [path.join(__dirname,'..','entities','*.js')],
        "migrations": ["migrations/*.js"],
        "cli":{"migrationsDir":"migrations"}
    };
} else {
    dbConnectionObj = {
        "type":"sqlite",
        "database":"./database.sqlite",
        "entities": [path.join(__dirname,'..','entities','*.js')],
        "subscribers":[path.join(__dirname,'..','subscribers','*.js')],
        "migrations":[path.join(__dirname,'..','subscribers','*.js')],
        "synchronize": true,
        "logging":false
    };
}

export default dbConnectionObj;