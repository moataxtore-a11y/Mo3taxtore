const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

console.log('bcrypt type:', typeof bcrypt);
if (bcrypt) {
    console.log('bcrypt keys:', Object.keys(bcrypt));
    console.log('bcrypt default type:', typeof bcrypt.default);
    if (bcrypt.default) {
        console.log('bcrypt.default keys:', Object.keys(bcrypt.default));
    }
}

try {
  const User = require('./models/User');
  console.log('User model loaded ok');
} catch (e) {
  console.error('User model load FAILED:', e.message, e.stack);
}

process.exit(0);
