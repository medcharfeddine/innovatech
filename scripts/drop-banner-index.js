const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nova';

async function dropIndex() {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });

    console.log('Connected to MongoDB');

    // Drop the conflicting index
    const collection = mongoose.connection.collection('banners');
    
    try {
      await collection.dropIndex('type_1');
      console.log('✓ Successfully dropped type_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('✓ Index type_1 does not exist (already dropped)');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

dropIndex();
