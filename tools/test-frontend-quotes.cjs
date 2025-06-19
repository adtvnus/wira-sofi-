const fetch = require('node-fetch');

async function testFrontendQuotes() {
  console.log('🔍 TESTING FRONTEND QUOTES WORKFLOW');
  
  try {
    // Step 1: Login to get token (same as frontend)
    console.log('\n1. 🔐 Login (same as frontend)...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful');

    // Step 2: Load quotes (same as frontend loadQuotes function)
    console.log('\n2. 📝 Load quotes (same as frontend)...');
    const API_BASE_URL = 'http://localhost:3001/api';
    
    const loadResponse = await fetch(`${API_BASE_URL}/quotes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (loadResponse.ok) {
      const loadData = await loadResponse.json();
      if (loadData.success) {
        console.log(`   ✅ Loaded ${loadData.data.length} quotes`);
        loadData.data.forEach((quote, index) => {
          console.log(`      ${index + 1}. "${quote.quote_text.substring(0, 30)}..." by ${quote.quote_author}`);
        });
      }
    } else {
      console.log('   ❌ Failed to load quotes');
    }

    // Step 3: Add quote (exact same as frontend addQuote function)
    console.log('\n3. ➕ Add quote (exact same as frontend)...');
    
    const newQuote = {
      quote_text: 'Frontend test quote: Love is the greatest adventure',
      quote_author: 'Frontend Test',
      quote_category: 'general',
      quote_image_url: '',
      display_order: 0
    };

    console.log('   📤 Frontend data structure:', JSON.stringify(newQuote, null, 2));

    // Transform to backend format (same as frontend)
    const backendData = {
      quoteText: newQuote.quote_text,
      quoteAuthor: newQuote.quote_author,
      quoteCategory: newQuote.quote_category,
      quoteImage: newQuote.quote_image_url,
      displayOrder: newQuote.display_order
    };

    console.log('   📤 Backend data structure:', JSON.stringify(backendData, null, 2));

    const addResponse = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    console.log(`   📊 Response status: ${addResponse.status} ${addResponse.statusText}`);

    if (addResponse.ok) {
      const addData = await addResponse.json();
      if (addData.success) {
        console.log('   ✅ Quote added successfully!');
        console.log(`   📝 New quote ID: ${addData.data.id}`);
        
        // Step 4: Verify by loading quotes again
        console.log('\n4. 🔍 Verify by loading quotes again...');
        const verifyResponse = await fetch(`${API_BASE_URL}/quotes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log(`   ✅ Now have ${verifyData.data.length} quotes total`);
          
          // Find our new quote
          const newQuoteInList = verifyData.data.find(q => q.id === addData.data.id);
          if (newQuoteInList) {
            console.log(`   ✅ New quote found: "${newQuoteInList.quote_text}"`);
          } else {
            console.log('   ❌ New quote not found in list');
          }
        }

        // Step 5: Clean up
        console.log('\n5. 🗑️ Clean up test quote...');
        const deleteResponse = await fetch(`${API_BASE_URL}/quotes/${addData.data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (deleteResponse.ok) {
          console.log('   ✅ Test quote deleted');
        } else {
          console.log('   ⚠️ Could not delete test quote');
        }
      } else {
        console.log('   ❌ Add quote failed - success: false');
        console.log('   📋 Response:', JSON.stringify(addData, null, 2));
      }
    } else {
      const errorData = await addResponse.json();
      console.log('   ❌ Add quote failed - HTTP error');
      console.log('   📋 Error response:', JSON.stringify(errorData, null, 2));
    }

    console.log('\n🎉 FRONTEND WORKFLOW TEST COMPLETED!');
    console.log('\n💡 If this works but frontend doesn\'t:');
    console.log('   - Check browser console for errors');
    console.log('   - Check network tab in developer tools');
    console.log('   - Verify token is being stored correctly');
    console.log('   - Check for CORS issues');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFrontendQuotes();
