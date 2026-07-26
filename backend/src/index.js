import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as usersSchema from '../models/user.model.js';
import * as preferenceSchema from '../models/user.preferences.model.js';

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl block so it connects safely to Neon
    ssl: {
        rejectUnauthorized: false
    }
});

const schema = {
    ...usersSchema,
    ...preferenceSchema,
};

const db = drizzle({ client: pool, schema });

export default db;