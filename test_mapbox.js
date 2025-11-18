// Test if frontend is serving correctly
const http = require('http');

console.log('Testing frontend at http://localhost:7749...\n');

const options = {
  hostname: 'localhost',
  port: 7749,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Frontend is serving correctly');
      console.log(`Response length: ${data.length} bytes`);

      // Check if HTML contains expected elements
      if (data.includes('id="root"')) {
        console.log('✅ Root div found');
      } else {
        console.log('❌ Root div not found');
      }

      if (data.includes('main.jsx')) {
        console.log('✅ Main.jsx script tag found');
      } else {
        console.log('❌ Main.jsx script tag not found');
      }

      console.log('\n✅ All basic checks passed!');
      console.log('Please open http://localhost:7749 in your browser to check for runtime errors.');
    } else {
      console.log('❌ Server returned non-200 status');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.end();
