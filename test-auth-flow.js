// Test script to verify authentication flow
const axios = require('axios');

const API_BASE = 'https://extrackify-1.onrender.com/api/v1';

async function testAuthFlow() {
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Test 1: Try to access protected route without token
    console.log('\n1. Testing protected route without token:');
    try {
      await axios.get(`${API_BASE}/users/me`);
    } catch (error) {
      console.log('✅ Expected error:', error.response?.status, error.response?.data?.message);
    }

    // Test 2: Login to get token
    console.log('\n2. Testing login:');
    const loginResponse = await axios.post(`${API_BASE}/users/login`, {
      email: 'test@example.com', // Replace with your test email
      password: 'testpassword123' // Replace with your test password
    });
    
    console.log('✅ Login successful!');
    console.log('Token received:', !!loginResponse.data.data?.accessToken);
    
    const token = loginResponse.data.data?.accessToken;
    
    // Test 3: Access protected route with token
    console.log('\n3. Testing protected route with token:');
    const authResponse = await axios.get(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Protected route accessible!');
    console.log('User data:', authResponse.data.data?.user?.email);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow();
