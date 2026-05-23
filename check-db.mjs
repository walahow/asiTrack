import mongoose from 'mongoose';

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");

  try {
    await mongoose.connect(uri);
    console.log("SUCCESS! Connection is fully functional.");
    const adminDb = mongoose.connection.db.admin();
    const info = await adminDb.command({ ping: 1 });
    console.log("Ping response:", info);
    process.exit(0);
  } catch (error) {
    console.error("CONNECTION FAILED:", error.message);
    process.exit(1);
  }
}

check();
