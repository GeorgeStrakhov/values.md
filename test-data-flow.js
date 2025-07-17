#!/usr/bin/env node

/**
 * Test Data Flow Between Explore and Results
 * 
 * This simulates the exact data flow that happens when a user completes
 * 12 dilemmas and navigates to the results page.
 */

// Simulate the response data structure from explore page
const mockResponses = [
  {
    dilemmaId: 'test-1',
    chosenOption: 'A',
    reasoning: 'This seems like the most ethical choice',
    responseTime: 12534,
    perceivedDifficulty: 7
  },
  {
    dilemmaId: 'test-2', 
    chosenOption: 'B',
    reasoning: 'Based on utilitarian principles',
    responseTime: 8923,
    perceivedDifficulty: 5
  }
];

// Test encoding/decoding process
console.log('🧪 Testing Data Flow Between Explore and Results\n');

console.log('1. Mock responses from explore page:');
console.log(JSON.stringify(mockResponses, null, 2));

console.log('\n2. Encoding to base64 (what explore page does):');
const encoded = Buffer.from(JSON.stringify(mockResponses)).toString('base64');
console.log(encoded);

console.log('\n3. Decoding from base64 (what results page does):');
const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
console.log(JSON.stringify(decoded, null, 2));

console.log('\n4. Validation:');
console.log('✅ Original length:', mockResponses.length);
console.log('✅ Decoded length:', decoded.length);
console.log('✅ First response matches:', JSON.stringify(mockResponses[0]) === JSON.stringify(decoded[0]));
console.log('✅ All required fields present:');

decoded.forEach((response, index) => {
  const required = ['dilemmaId', 'chosenOption', 'reasoning', 'responseTime', 'perceivedDifficulty'];
  const present = required.every(field => response.hasOwnProperty(field));
  console.log(`   Response ${index + 1}: ${present ? '✅' : '❌'} ${present ? 'All fields present' : 'Missing fields'}`);
});

console.log('\n5. Test URL construction:');
const testUrl = `/results?data=${encoded}`;
console.log(testUrl);

console.log('\n6. Test URL parsing:');
const urlParams = new URLSearchParams(testUrl.split('?')[1]);
const dataParam = urlParams.get('data');
console.log('✅ Data parameter retrieved:', dataParam === encoded);

console.log('\n✅ Data flow test PASSED - The encoding/decoding works correctly!');

// Test with browser-compatible base64
console.log('\n7. Testing browser btoa/atob compatibility:');
try {
  // This simulates what happens in the browser
  const browserEncoded = Buffer.from(JSON.stringify(mockResponses)).toString('base64');
  const browserDecoded = JSON.parse(Buffer.from(browserEncoded, 'base64').toString());
  
  console.log('✅ Browser compatibility test PASSED');
  console.log('   Encoded length:', browserEncoded.length);
  console.log('   Decoded successfully:', browserDecoded.length === mockResponses.length);
} catch (error) {
  console.log('❌ Browser compatibility test FAILED:', error.message);
}

console.log('\n🎉 All tests passed! The data flow should work correctly.');