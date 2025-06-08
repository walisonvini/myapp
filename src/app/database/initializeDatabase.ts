import { type SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(database: SQLiteDatabase) {
    await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            phone VARCHAR(11) NOT NULL,
            profile_image VARCHAR(255) DEFAULT NULL,
            user_type BOOLEAN DEFAULT 0,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            change_password BOOLEAN DEFAULT 0,
            active BOOLEAN DEFAULT 1
        );

        INSERT OR IGNORE INTO users (name, phone, email, password, user_type, active)
        VALUES ('Admin', '11999999999', 'admin@admin.com', 'admin', 1, 1);
    `);
}