import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    const adminEmail = 'admin@values.md';
    const adminPassword = process.env.ADMIN_PASSWORD || 'hohoho';
    
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    await db.insert(users).values({
      id: 'admin-user-1',
      name: 'Admin',
      email: adminEmail,
      role: 'admin',
      password: hashedPassword,
    });
    
    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();