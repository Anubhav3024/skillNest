const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB = process.env.MONGO_URL;

const connectDB = async () => {
  if (!DB) {
    console.warn("MongoDB connection skipped: MONGO_URL is not set.");
    return false;
  }

  try {
    mongoose
      .connect(DB, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      .then(() => {
        console.log("MongoDB Connected !!!");
      })
      .catch((error) => {
        console.log("MongoDB connection error", error);
      });

    return true;
  } catch (error) {
    console.log("MongoDB connection error", error);
    return false;
  }
};

module.exports =  connectDB;
