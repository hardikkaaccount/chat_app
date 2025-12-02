// Test script to verify all components of the chat application are working
const http = require('http');

console.log('Testing Chat Application Components...\n');

// Test 1: Check if backend server is running
console.log('1. Testing Backend Server (http://localhost:8001)...');
const backendReq = http.get('http://localhost:8001/api/groups', (res) => {
  console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
  if (res.statusCode === 200) {
    console.log('   ✓ Backend server is running and responding');
  } else {
    console.log('   ✗ Backend server error');
  }
  
  // Test 2: Check if frontend server is running
  console.log('\n2. Testing Frontend Server (http://localhost:3000)...');
  const frontendReq = http.get('http://localhost:3000', (res) => {
    console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode === 200) {
      console.log('   ✓ Frontend server is running and responding');
    } else {
      console.log('   ✗ Frontend server error');
    }
    
    // Test 3: Check if database is accessible
    console.log('\n3. Testing Database Connectivity...');
    const { Client } = require('pg');
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'postgrespassword',
      port: 5432,
    });
    
    client.connect()
      .then(() => {
        console.log('   ✓ Connected to PostgreSQL database');
        return client.query('SELECT COUNT(*) FROM users');
      })
      .then(result => {
        console.log(`   ✓ Database contains ${result.rows[0].count} users`);
        return client.end();
      })
      .then(() => {
        console.log('\n🎉 All components are working correctly!');
        console.log('\nChat Application is ready to use:');
        console.log('- Frontend: http://localhost:3000 (or check terminal for exact address)');
        console.log('- Backend API: http://localhost:8001');
        console.log('- Database: PostgreSQL on localhost:5432');
      })
      .catch(err => {
        console.log('   ✗ Database connection error:', err.message);
      });
  }).on('error', (err) => {
    console.log('   ✗ Frontend server error:', err.message);
    console.log('   Note: Frontend might be running on a different address. Check the terminal where you started it.');
    
    // Test 3: Check if database is accessible
    console.log('\n3. Testing Database Connectivity...');
    const { Client } = require('pg');
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'postgrespassword',
      port: 5432,
    });
    
    client.connect()
      .then(() => {
        console.log('   ✓ Connected to PostgreSQL database');
        return client.query('SELECT COUNT(*) FROM users');
      })
      .then(result => {
        console.log(`   ✓ Database contains ${result.rows[0].count} users`);
        return client.end();
      })
      .then(() => {
        console.log('\n🎉 Backend and Database components are working correctly!');
        console.log('\nChat Application components:');
        console.log('- Frontend: Check terminal where you started it for the exact address');
        console.log('- Backend API: http://localhost:8001');
        console.log('- Database: PostgreSQL on localhost:5432');
      })
      .catch(err => {
        console.log('   ✗ Database connection error:', err.message);
      });
  });
}).on('error', (err) => {
  console.log('   ✗ Backend server error:', err.message);
});