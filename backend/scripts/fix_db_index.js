const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function fixIndices() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        console.log('Listing existing indices on users collection...');
        const indexes = await usersCollection.indexes();
        console.log(indexes);

        const emailIndex = indexes.find(idx => idx.name === 'email_1' || (idx.key && idx.key.email));
        
        if (emailIndex) {
            console.log('Found email index:', emailIndex);
            if (!emailIndex.sparse) {
                console.log('Index is NOT sparse. Dropping and recreating it...');
                await usersCollection.dropIndex(emailIndex.name);
                console.log('✅ Dropped');
                
                // We don't explicitly recreate it here; Mongoose will do it when the app starts if it sees it's missing.
                // But let's be safe and do it now.
                await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
                console.log('✅ Recreated as sparse');
            } else {
                console.log('Index is already sparse. The issue might be that multiple documents actually HAVE a null value explicitly.');
                
                // Let's check for multiple documents with email: null
                const nullEmailCount = await usersCollection.countDocuments({ email: null });
                console.log('Documents with explicit email: null:', nullEmailCount);
                
                if (nullEmailCount > 1) {
                    console.log('Warning: Found multiple documents with email: null. Cleaning them up (removing the field)...');
                    const res = await usersCollection.updateMany({ email: null }, { $unset: { email: "" } });
                    console.log('✅ Updated', res.modifiedCount, 'documents');
                }
            }
        } else {
            console.log('Email index not found. Creating it now as sparse...');
            await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
            console.log('✅ Created as sparse');
        }

        console.log('✅ DONE');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
}

fixIndices();
