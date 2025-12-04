const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nova';

async function cleanBanners() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
    });

    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const bannerCollection = db.collection('banners');
    
    // Get all indexes
    console.log('Fetching indexes...');
    const indexes = await bannerCollection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Drop the problematic type_1 index if it exists
    if (indexes.type_1) {
      console.log('Dropping type_1 index...');
      await bannerCollection.dropIndex('type_1');
      console.log('✓ Successfully dropped type_1 index');
    } else {
      console.log('✓ type_1 index does not exist');
    }

    // Option: Clear all documents with null type
    const result = await bannerCollection.deleteMany({ type: null });
    if (result.deletedCount > 0) {
      console.log(`✓ Deleted ${result.deletedCount} documents with null type`);
    }

    // List remaining indexes
    const updatedIndexes = await bannerCollection.getIndexes();
    console.log('Indexes after cleanup:', Object.keys(updatedIndexes));

    await mongoose.connection.close();
    console.log('✓ Connection closed');
    console.log('\n✓ Banner collection cleanup complete!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

cleanBanners();
