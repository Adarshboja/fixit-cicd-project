import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding an admin.');
  process.exit(1);
}

try {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { name: 'FixIt Admin', email: email.toLowerCase(), password: hashedPassword, role: 'ADMIN' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ready: ${user.email}`);
  await User.db.closeConnection?.();
  process.exit(0);
} catch (error) {
  console.error(`Unable to seed admin: ${error.message}`);
  process.exit(1);
}
