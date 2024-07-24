import 'dotenv/config';
import { DataSource } from "typeorm";

export const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_APP_HOST,
    port: +(process.env.DB_APP_PORT ?? 0),
    username: process.env.DB_APP_USERNAME,
    password: process.env.DB_APP_PASSWORD,
    database: process.env.DB_APP_DATABASE,
    entities: ["src/database/entity/**/*.ts"],
    migrations: ["src/database/seed/**/*.ts"],
    migrationsTableName: "typeorm.seed-migrations",
});
