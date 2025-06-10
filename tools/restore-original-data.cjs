#!/usr/bin/env node

// Restore original bride-groom data

async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

const API_BASE_URL = 'http://localhost:3001/api';

async function restoreOriginalData() {
  console.log('🔄 RESTORING ORIGINAL BRIDE-GROOM DATA');
  console.log('═══════════════════════════════════════');
  
  const fetch = await getFetch();

  try {
    // Login
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Restore original data
    const originalData = {
      groomFirstName: 'Wira',
      groomLastName: 'Maulana',
      groomFullName: 'Wira Maulana',
      groomParentNames: 'Bapak Ahmad & Ibu Siti',
      brideFirstName: 'Sofi',
      brideLastName: 'Kumala',
      brideFullName: 'Sofi Kumala',
      brideParentNames: 'Bapak Budi & Ibu Rina'
    };

    const saveResponse = await fetch(`${API_BASE_URL}/bride-groom/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(originalData)
    });

    if (saveResponse.ok) {
      console.log('✅ Original data restored successfully');
      console.log('   Groom: Wira Maulana');
      console.log('   Bride: Sofi Kumala');
    } else {
      console.log('❌ Failed to restore data');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restoreOriginalData().catch(console.error);
