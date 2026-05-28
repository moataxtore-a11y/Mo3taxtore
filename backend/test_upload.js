const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const form = new FormData();
    form.append('title', 'Test Book');
    form.append('description', 'Test Description');
    form.append('price', '100');
    form.append('category', 'mathematics');
    form.append('stock', '10');
    
    // We need a token for a teacher
    // Let's login as the seeded teacher first
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'teacher@moataxtore.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    
    console.log('Logged in, got token');

    const res = await axios.post('http://localhost:5000/api/books', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Success:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUpload();
