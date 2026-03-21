const mongoose = require("mongoose");
require("dotenv").config();

const DB = process.env.MONGO_URL;

async function checkIndexes() {
  try {
    if (!DB || typeof DB !== "string" || !DB.trim()) {
      console.error("Missing required environment variable: MONGO_URL");
      process.exit(1);
    }

    await mongoose.connect(DB);
    console.log("Connected to DB");

    const User = mongoose.connection.collection("users");
    const indexes = await User.indexes();
    console.log("Current Indexes for 'users' collection:");
    console.log(JSON.stringify(indexes, null, 2));

    // Potential problematic indexes often have names like userEmail_1 or userName_1
    // If they were created manually with different options, they might conflict.

    process.exit(0);
  } catch (error) {
    console.error("Error checking indexes:", error);
    process.exit(1);
  }
}

checkIndexes();
