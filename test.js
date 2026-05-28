const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/moataxtore').then(async () => {
    let users = await User.find({}).select('email lastActive');
    console.log('All Users:', users);
    
    const count = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) } });
    console.log('ACTIVE:', count);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
