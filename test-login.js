// A simple test script for the login endpoint
const fetch = require('node-fetch');

const API_URL = 'https://econest-70qt.onrender.com/api';
// Test login credentials
const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',  // Replace with a valid user email
        password: 'password123',    // Replace with a valid password
      }),
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error testing login:', error);
    return { error: error.message };
  }
};

testLogin();

testLogin();
