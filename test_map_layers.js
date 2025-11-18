const http = require('http');

console.log('🧪 Testing WebGIS Map Layer Functionality\n');
console.log('='.repeat(50));

let testsPass = 0;
let testsFail = 0;

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data, headers: res.headers });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  // Test 1: Frontend is serving
  console.log('\n📋 Test 1: Frontend serving');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 7749,
      path: '/',
      method: 'GET'
    });

    if (result.statusCode === 200 && result.data.includes('id="root"')) {
      console.log('   ✅ PASS - Frontend is serving correctly');
      testsPass++;
    } else {
      console.log('   ❌ FAIL - Frontend not responding correctly');
      testsFail++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - ${error.message}`);
    testsFail++;
  }

  // Test 2: Backend API - List Layers
  console.log('\n📋 Test 2: Backend API - List Layers');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/layers/',
      method: 'GET'
    });

    if (result.statusCode === 200) {
      const data = JSON.parse(result.data);
      if (data.results && Array.isArray(data.results)) {
        console.log(`   ✅ PASS - API returned ${data.results.length} layer(s)`);
        data.results.forEach(layer => {
          console.log(`      - ${layer.name} (ID: ${layer.id}, Type: ${layer.geom_type})`);
        });
        testsPass++;

        // Test 3: Get Features for first layer
        if (data.results.length > 0) {
          const firstLayer = data.results[0];
          console.log(`\n📋 Test 3: Get Features for "${firstLayer.name}"`);

          try {
            const featuresResult = await makeRequest({
              hostname: 'localhost',
              port: 8080,
              path: `/api/v1/layers/${firstLayer.id}/features/`,
              method: 'GET'
            });

            if (featuresResult.statusCode === 200) {
              const featuresData = JSON.parse(featuresResult.data);
              if (featuresData.type === 'FeatureCollection' && Array.isArray(featuresData.features)) {
                console.log(`   ✅ PASS - Got ${featuresData.features.length} feature(s)`);
                if (featuresData.features.length > 0) {
                  const firstFeature = featuresData.features[0];
                  console.log(`      - First feature: ${firstFeature.properties.name || 'Unnamed'}`);
                  console.log(`      - Geometry type: ${firstFeature.geometry.type}`);
                  console.log(`      - Coordinates: [${firstFeature.geometry.coordinates.join(', ')}]`);
                }
                testsPass++;
              } else {
                console.log('   ❌ FAIL - Invalid GeoJSON format');
                testsFail++;
              }
            } else {
              console.log(`   ❌ FAIL - Status ${featuresResult.statusCode}`);
              testsFail++;
            }
          } catch (error) {
            console.log(`   ❌ FAIL - ${error.message}`);
            testsFail++;
          }
        }
      } else {
        console.log('   ❌ FAIL - Invalid response format');
        testsFail++;
      }
    } else {
      console.log(`   ❌ FAIL - Status ${result.statusCode}`);
      testsFail++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - ${error.message}`);
    testsFail++;
  }

  // Test 4: Check Mapbox token in constants
  console.log('\n📋 Test 4: Mapbox configuration');
  const fs = require('fs');
  try {
    const constantsFile = fs.readFileSync('./frontend/src/constants/map.constants.js', 'utf8');
    if (constantsFile.includes('pk.eyJ1IjoidGhpZW5odXUyMDA1')) {
      console.log('   ✅ PASS - Mapbox token configured');
      testsPass++;
    } else {
      console.log('   ❌ FAIL - Mapbox token not found');
      testsFail++;
    }
  } catch (error) {
    console.log(`   ❌ FAIL - ${error.message}`);
    testsFail++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testsPass}`);
  console.log(`❌ Failed: ${testsFail}`);
  console.log(`📈 Success Rate: ${Math.round((testsPass / (testsPass + testsFail)) * 100)}%`);

  if (testsFail === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✨ Next Steps:');
    console.log('   1. Open http://localhost:7749 in your browser');
    console.log('   2. Click "Layers" button in top toolbar');
    console.log('   3. Toggle layers on/off to see them on the map');
    console.log('   4. Try 3D mode button 🗻');
    console.log('   5. Try Dark mode button 🌙');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please check the errors above and fix them.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
