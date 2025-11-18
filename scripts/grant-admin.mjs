import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

async function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, '../backend/.env');
  dotenv.config({ path: envPath });
}

async function main() {
  await loadEnv();

  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/grant-admin.mjs <user-email>');
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
    const userRoles = db.collection('user_roles');

    const user = await profiles.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const existingRole = await userRoles.findOne({ user_id: user.id });

    if (existingRole) {
      if (existingRole.role === 'admin') {
        console.log(`User ${email} is already an admin.`);
      } else {
        await userRoles.updateOne(
          { _id: existingRole._id },
          { $set: { role: 'admin', updated_at: new Date() } }
        );
        console.log(`Updated existing role to admin for ${email}.`);
      }
    } else {
      await userRoles.insertOne({
        id: crypto.randomUUID(),
        user_id: user.id,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log(`Admin role granted to ${email}.`);
    }
  } catch (error) {
    console.error('Failed to grant admin role:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
