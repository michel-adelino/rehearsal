/**
 * Script to create the first user in the database
 * 
 * Usage:
 *   npm run create-user
 * 
 * Edit the email, password, and name below before running.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Edit these values before running the script
const EMAIL = 'admin@example.com';
const PASSWORD = 'Admini123!';
const NAME = 'Admin User'; // Optional, set to null if not needed

async function createUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: EMAIL.toLowerCase().trim() },
    });

    if (existingUser) {
      console.error(`Error: User with email ${EMAIL} already exists`);
      process.exit(1);
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // Create user
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        email: EMAIL.toLowerCase().trim(),
        passwordHash,
        name: NAME || null,
      },
    });

    console.log('\n✅ User created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    if (user.name) {
      console.log(`   Name: ${user.name}`);
    }
    console.log('\nYou can now log in with this account.');
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
