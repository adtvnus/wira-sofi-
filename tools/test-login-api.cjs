const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 TESTING LOGIN API');
  
  try {
    // Test login
    console.log('\n1. 🚪 Testing login...');
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

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('   ✅ Login successful!');
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      console.log(`   User: ${loginData.user.fullName} (${loginData.user.role})`);
      
      // Test quotes API with token
      console.log('\n2. 📝 Testing quotes API...');
      const quotesResponse = await fetch('http://localhost:3001/api/quotes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      const quotesData = await quotesResponse.json();
      
      if (quotesResponse.ok) {
        console.log('   ✅ Quotes API working!');
        console.log(`   Found ${quotesData.data.length} quotes`);
        quotesData.data.forEach((quote, index) => {
          console.log(`   Quote ${index + 1}: "${quote.quote_text.substring(0, 50)}..." by ${quote.quote_author}`);
        });
      } else {
        console.log('   ❌ Quotes API failed:', quotesData.error);
      }

      // Test quotes POST (add new quote)
      console.log('\n3. ➕ Testing add quote...');
      const newQuoteResponse = await fetch('http://localhost:3001/api/quotes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteText: 'Test API Quote: Two hearts, one love, forever together.',
          quoteAuthor: 'API Test'
        })
      });

      const newQuoteData = await newQuoteResponse.json();
      
      if (newQuoteResponse.ok) {
        console.log('   ✅ Quote added successfully!');
        console.log(`   New quote ID: ${newQuoteData.data.id}`);
        
        // Clean up - delete test quote
        console.log('\n4. 🗑️ Cleaning up test quote...');
        const deleteResponse = await fetch(`http://localhost:3001/api/quotes/${newQuoteData.data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          console.log('   ✅ Test quote deleted');
        } else {
          console.log('   ⚠️ Could not delete test quote');
        }
      } else {
        console.log('   ❌ Add quote failed:', newQuoteData.error);
      }

    } else {
      console.log('   ❌ Login failed:', loginData.error);
      console.log('   Please check credentials in database');
    }
    
    console.log('\n🎉 API TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure backend server is running on port 3001');
  }
}

testLogin();
