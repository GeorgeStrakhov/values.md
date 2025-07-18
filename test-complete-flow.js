// Simple integration test for the complete user flow
// This tests the localStorage-based flow: landing → explore → results

async function testCompleteFlow() {
  console.log('🧪 Testing complete user flow...');
  
  // Test 1: Landing page loads
  console.log('1. Testing landing page...');
  const landingResponse = await fetch('http://localhost:3004/');
  if (!landingResponse.ok) {
    throw new Error('Landing page failed to load');
  }
  console.log('✅ Landing page loads successfully');
  
  // Test 2: Dilemmas API endpoint
  console.log('2. Testing dilemmas API...');
  const dilemmasResponse = await fetch('http://localhost:3004/api/dilemmas');
  if (!dilemmasResponse.ok) {
    throw new Error('Dilemmas API failed');
  }
  const dilemmasData = await dilemmasResponse.json();
  if (!dilemmasData.dilemmas || dilemmasData.dilemmas.length === 0) {
    throw new Error('No dilemmas returned from API');
  }
  console.log(`✅ Dilemmas API returns ${dilemmasData.dilemmas.length} dilemmas`);
  
  // Test 3: Generate values API with mock data
  console.log('3. Testing values generation API...');
  const mockResponses = [
    {
      dilemmaId: dilemmasData.dilemmas[0].dilemmaId,
      chosenOption: 'A',
      reasoning: 'Test reasoning',
      responseTime: 5000,
      perceivedDifficulty: 5
    }
  ];
  
  const valuesResponse = await fetch('http://localhost:3004/api/generate-values', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ responses: mockResponses })
  });
  
  if (!valuesResponse.ok) {
    throw new Error('Values generation API failed');
  }
  
  const valuesData = await valuesResponse.json();
  if (!valuesData.valuesMarkdown) {
    throw new Error('No values markdown generated');
  }
  console.log('✅ Values generation API works correctly');
  
  // Test 4: Research export API
  console.log('4. Testing research export API...');
  const exportResponse = await fetch('http://localhost:3004/api/research/export?type=responses');
  if (!exportResponse.ok) {
    throw new Error('Research export API failed');
  }
  const csvData = await exportResponse.text();
  if (!csvData.includes('session_id')) {
    throw new Error('Invalid CSV format');
  }
  console.log('✅ Research export API works correctly');
  
  console.log('🎉 All tests passed! Complete user flow is working.');
}

// Run the test
testCompleteFlow().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});