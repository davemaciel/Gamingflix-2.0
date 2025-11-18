import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

async function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, '../backend/.env');
  dotenv.config({ path: envPath });
}

async function main() {
  await loadEnv();

  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password.mjs <user-email> <new-password>');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('New password must be at least 6 characters long.');
    process.exit(1);
  }

  const mongoUrl = process.env.MONGODB_URL;
  const dbName = process.env.MONGODB_DB_NAME || 'gameflix';

  if (!mongoUrl) {
    console.error('Missing MONGODB_URL in environment.');
    process.exit(1);
  }

  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);
    const profiles = db.collection('profiles');

    const user = await profiles.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await profiles.updateOne(
      { id: user.id },
      {
        $set: {
          password: hashedPassword,
          updated_at: new Date()
        },
        $unset: {
          reset_token: '',
          reset_token_expiry: ''
        }
      }
    );

    console.log(`Password reset successfully for ${email}.`);
  } catch (error) {
    console.error('Failed to reset password:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
