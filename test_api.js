// Test script to verify API response format
const fetch = require('node-fetch');

const API_URL = 'http://localhost:8080/api/v1';

async function testLogin() {
  console.log('Testing login...');
  const response = await fetch(`${API_URL}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teacher@example.com',
      password: 'password123'
    })
  });

  const data = await response.json();
  console.log('Login response:', JSON.stringify(data, null, 2));
  return data.access;
}

async function testListClassrooms(token) {
  console.log('\nTesting list classrooms...');
  const response = await fetch(`${API_URL}/classrooms/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  console.log('Classrooms response:', JSON.stringify(data, null, 2));
  return data;
}

async function testCreateClassroom(token) {
  console.log('\nTesting create classroom...');
  const response = await fetch(`${API_URL}/classrooms/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `Test Classroom ${Date.now()}`
    })
  });

  const data = await response.json();
  console.log('Create response:', JSON.stringify(data, null, 2));
  return data;
}

(async () => {
  try {
    const token = await testLogin();
    const classrooms = await testListClassrooms(token);
    const newClassroom = await testCreateClassroom(token);
    const updatedClassrooms = await testListClassrooms(token);

    console.log('\n=== SUMMARY ===');
    console.log('Initial classrooms count:', classrooms.length || 0);
    console.log('After create count:', updatedClassrooms.length || 0);
    console.log('New classroom has teacher_email:', !!newClassroom.teacher_email);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
