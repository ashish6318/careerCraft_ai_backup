// server/tests/setupEnv.js
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // Loads .env from server/
console.log('JWT_SECRET in test setup:', process.env.JWT_SECRET); // Add this line for debugging
