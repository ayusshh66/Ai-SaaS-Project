import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// 1. Import BOTH models
import * as userSchema from '../models/user.model.js';
import * as preferenceSchema from '../models/user.preferences.model.js';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// 2. Merge them into one schema object
const schema = {
    ...userSchema,
    ...preferenceSchema
};

const db = drizzle({ client: pool, schema });

export default db;