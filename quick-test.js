const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test landing
    await page.goto('http://localhost:3004');
    const title = await page.textContent('h1');
    console.log('✅ Landing loads:', title && title.includes('values') ? 'SUCCESS' : 'FAIL');
    
    // Test explore
    await page.goto('http://localhost:3004/explore');
    await page.waitForTimeout(3000);
    const content = await page.textContent('body');
    console.log('✅ Explore loads:', content && content.includes('Question 1 of') ? 'SUCCESS' : 'FAIL');
    
    // Test results
    await page.goto('http://localhost:3004/results');
    const resultContent = await page.textContent('body');
    console.log('✅ Results loads:', resultContent && !resultContent.includes('404') ? 'SUCCESS' : 'FAIL');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest();