/**
 * Debug Strava API calls
 * Run: node test_strava_debug.js <access_token>
 */

const accessToken = process.argv[2];

if (!accessToken) {
  console.error('❌ Usage: node test_strava_debug.js <your_access_token>');
  process.exit(1);
}

async function testStravaAPI() {
  console.log('\n🔍 Testing Strava API with token:', accessToken.substring(0, 20) + '...\n');

  // Test 1: Get Athlete
  console.log('📍 TEST 1: Fetching athlete info...');
  try {
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', athleteResponse.status);
    const athleteData = await athleteResponse.json();
    
    if (athleteResponse.ok) {
      console.log('✅ Athlete:', athleteData.firstname, athleteData.lastname);
    } else {
      console.log('❌ Error:', athleteData);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  // Test 2: Get Activities
  console.log('\n📍 TEST 2: Fetching activities...');
  try {
    const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5&page=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', activitiesResponse.status);
    const activitiesData = await activitiesResponse.json();
    
    if (activitiesResponse.ok) {
      console.log('✅ Activities found:', activitiesData.length);
      activitiesData.slice(0, 3).forEach(a => {
        console.log(`  - ${a.name} (${a.type})`);
      });
    } else {
      console.log('❌ Error:', activitiesData);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }

  console.log('\n✅ Debug complete!\n');
}

testStravaAPI();
