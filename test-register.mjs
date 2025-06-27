// Basic test script to register a test user
const fetch = require('node-fetch');

const API_URL = 'https://econest-70qt.onrender.com/api';

const testRegister = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    // Create a unique test user with timestamp
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'Password123!',
      phone: '1234567890',
      currentAddress: 'Test Address'
    };
    
    console.log('Registering test user:', testUser.email);
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('=============================================================');
      console.log('Registration successful! Use these credentials to test login:');
      console.log(`Email: ${testUser.email}`);
      console.log(`Password: ${testUser.password}`);
      console.log('=============================================================');
    }
    
    return data;
  } catch (error) {
    console.error('Error testing registration:', error);
    return { error: error.message };
  }
};

testRegister();
