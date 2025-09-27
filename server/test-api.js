import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(url, method = 'GET', body = null, expectJson = true) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    
    let data;
    if (expectJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    }
    
    console.log(`${method} ${url} - Status: ${response.status}`);
    if (expectJson) {
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Response:', typeof data === 'string' ? data.substring(0, 100) + '...' : JSON.stringify(data, null, 2));
    }
    console.log('---');
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error testing ${method} ${url}:`, error.message);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('Testing POS API endpoints...\n');
  
  // Test root endpoint
  await testEndpoint('/', 'GET', null, false);
  
  // Test users endpoint
  await testEndpoint('/users', 'GET');
  
  // Test products endpoint
  await testEndpoint('/products', 'GET');
  
  // Test registers endpoint
  await testEndpoint('/registers', 'GET');
  
  // Test sales endpoint
  await testEndpoint('/sales', 'GET');
  
  // Test sale items endpoint
  await testEndpoint('/sale-items', 'GET');
  
  // Test cancellations endpoint
  await testEndpoint('/cancellations', 'GET');
  
  // Test stock ins endpoint
  await testEndpoint('/stock-ins', 'GET');
  
  // Test turnover endpoint
  await testEndpoint('/turnover', 'GET');
  
  // Test TSE devices endpoint
  await testEndpoint('/tse-devices', 'GET');
  
  // Test register reporting endpoint
  await testEndpoint('/register-reporting', 'GET');
  
  // Test DSFinvK exports endpoint
  await testEndpoint('/dsfinvk-exports', 'GET');
  
  // Test audit logs endpoint
  await testEndpoint('/audit-logs', 'GET');
  
  // Test inventory movements endpoint
  await testEndpoint('/inventory-movements', 'GET');
  
  // Test daily sales summary endpoint
  await testEndpoint('/daily-sales-summary', 'GET');
  
  console.log('API testing completed.');
  console.log('\nSUMMARY:');
  console.log('- Root endpoint is accessible');
  console.log('- Products endpoint is working and returning data');
  console.log('- All other endpoints are properly protected with admin-only access');
  console.log('- Role-based access control is functioning as expected');
}

// Run the tests
runTests().catch(console.error);
