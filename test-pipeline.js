// Test the complete response pipeline
async function testResponsePipeline() {
    console.log('🧪 Testing Response Pipeline...');
    
    // 1. Test localStorage data structure
    console.log('\n1️⃣ Testing localStorage...');
    const stored = localStorage.getItem('dilemma-session');
    if (!stored) {
        console.error('❌ No dilemma-session in localStorage');
        return;
    }
    
    let parsed;
    try {
        parsed = JSON.parse(stored);
        console.log('✅ localStorage parsed successfully');
        console.log('📊 Data structure:', Object.keys(parsed));
        console.log('📊 Responses count:', parsed.responses?.length || 0);
        console.log('📊 Session ID:', parsed.sessionId);
        
        if (!parsed.responses || parsed.responses.length === 0) {
            console.error('❌ No responses in localStorage data');
            return;
        }
        
        // Check response structure
        const firstResponse = parsed.responses[0];
        console.log('📊 First response structure:', Object.keys(firstResponse));
        console.log('📊 First response:', firstResponse);
        
    } catch (e) {
        console.error('❌ Failed to parse localStorage:', e);
        return;
    }
    
    // 2. Test API responses submission
    console.log('\n2️⃣ Testing /api/responses...');
    try {
        const submitResponse = await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: parsed.sessionId,
                responses: parsed.responses
            })
        });
        
        console.log('📡 Submit status:', submitResponse.status);
        const submitData = await submitResponse.json();
        console.log('📡 Submit response:', submitData);
        
        if (!submitResponse.ok) {
            console.error('❌ Failed to submit responses');
            return;
        }
        console.log('✅ Responses submitted successfully');
        
    } catch (e) {
        console.error('❌ Error submitting responses:', e);
        return;
    }
    
    // 3. Wait a moment for database consistency
    console.log('\n⏳ Waiting 2s for database consistency...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Test values generation
    console.log('\n3️⃣ Testing /api/generate-values...');
    try {
        const valuesResponse = await fetch('/api/generate-values', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: parsed.sessionId })
        });
        
        console.log('📊 Values status:', valuesResponse.status);
        
        if (!valuesResponse.ok) {
            const errorText = await valuesResponse.text();
            console.error('❌ Values generation failed:', errorText);
            return;
        }
        
        const valuesData = await valuesResponse.json();
        console.log('✅ Values generated successfully');
        console.log('📊 Values data keys:', Object.keys(valuesData));
        console.log('📊 Values markdown length:', valuesData.valuesMarkdown?.length || 0);
        
    } catch (e) {
        console.error('❌ Error generating values:', e);
        return;
    }
    
    console.log('\n🎉 Pipeline test completed successfully!');
}

// Run the test
testResponsePipeline().catch(console.error);