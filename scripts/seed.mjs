import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define a minimal Mongoose schema for Admin just for seeding
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  created_at: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
  }

  const username = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'adminasi123';
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@asitrack.id';

  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(uri);
    console.log("Connected.");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log(`Admin user '${username}' already exists. Skipping creation.`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      email,
      role: 'super_admin'
    });

    await newAdmin.save();
    console.log(`Successfully created super_admin: ${username}`);
    process.exit(0);
  } catch (error) {
    console.error("SEEDING FAILED:", error);
    process.exit(1);
  }
}

seed();
