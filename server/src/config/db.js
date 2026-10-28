const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is missing.');
  }

  // Validate that MONGO_URI is a complete connection string, not placeholder or credentials alone
  const isValidFormat = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  if (!isValidFormat) {
    throw new Error(
      `Invalid MONGO_URI format. It must start with 'mongodb://' or 'mongodb+srv://'. Provided: ${uri.substring(0, 15)}...`
    );
  }

  if (uri.includes('<username>') || uri.includes('<password>')) {
    throw new Error(
      'MONGO_URI contains unreplaced placeholder tokens (<username> or <password>). Please supply valid Atlas credentials.'
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
