const mongoose = require("mongoose");
require("dotenv").config();

const DB = process.env.MONGO_URL;

async function cleanIndexes() {
  try {
    if (!DB || typeof DB !== "string" || !DB.trim()) {
      console.error("Missing required environment variable: MONGO_URL");
      process.exit(1);
    }

    await mongoose.connect(DB);
    console.log("Connected to DB");

    const User = mongoose.connection.collection("users");
    const indexes = await User.indexes();
    console.log("Found indexes:", JSON.stringify(indexes.map((i) => i.name)));

    for (const index of indexes) {
      if (index.name !== "_id_") {
        console.log(`Dropping index: ${index.name}`);
        await User.dropIndex(index.name);
      }
    }

    console.log("Index cleanup complete.");
    process.exit(0);
  } catch (error) {
    if (error.message.includes("ns not found")) {
      console.log(
        "Collection 'users' does not exist yet. No indexes to clean.",
      );
      process.exit(0);
    }
    console.error("Error during index cleanup:", error);
    process.exit(1);
  }
}

cleanIndexes();
