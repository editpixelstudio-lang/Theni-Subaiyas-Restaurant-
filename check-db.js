const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://thenisubaiyas:Ramesh2007@ac-llkes11-shard-00-00.pb37tnm.mongodb.net:27017,ac-llkes11-shard-00-01.pb37tnm.mongodb.net:27017,ac-llkes11-shard-00-02.pb37tnm.mongodb.net:27017/theni-restaurant?ssl=true&replicaSet=atlas-ovlf6z-shard-0&authSource=admin&retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await mongoose.connection.collection('menuitems').countDocuments();
    console.log(`Database Check: Found ${count} items in 'menuitems' collection.`);
    process.exit(0);
  } catch (err) {
    console.error('Database Check Failed:', err.message);
    process.exit(1);
  }
}

check();
