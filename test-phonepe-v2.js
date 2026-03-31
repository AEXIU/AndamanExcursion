// PhonePe v2 API Test - Proves your merchant works!
const axios = require('axios');

const CLIENT_ID = 'TEST-M22MJAWSWDOOT_25070';
const CLIENT_SECRET = 'MmY1OWJmMDEtNmE2Yi00Zjg3LWE4ZTUtNjNkZGRhYzRlMzBi';
const API_BASE = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

// Step 1: Get OAuth Token
async function getAccessToken() {
  const requestBody = new URLSearchParams({
    client_version: '1',
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }).toString();

  const response = await axios.post(
    `${API_BASE}/v1/oauth/token`,
    requestBody,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );

  console.log('✅ OAuth Token Generated:', response.data.access_token.substring(0, 50) + '...');
  return response.data.access_token;
}

// Step 2: Create Payment
async function createPayment(accessToken) {
  const merchantOrderId = `TEST_ORDER_${Date.now()}`;
  
  const requestBody = {
    amount: 3500, // ₹35.00
    expireAfter: 1200,
    metaInfo: {
      udf1: 'Activity Booking',
      udf2: 'Sea Walk'
    },
    paymentFlow: {
      type: 'PG_CHECKOUT',
      message: 'Complete your booking payment',
      merchantUrls: {
        redirectUrl: 'http://127.0.0.1:3000/checkout/payment-return'
      }
    },
    merchantOrderId
  };

  const response = await axios.post(
    `${API_BASE}/checkout/v2/pay`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${accessToken}`
      }
    }
  );

  console.log('\n✅ Payment Created:');
  console.log('   Order ID:', response.data.orderId);
  console.log('   State:', response.data.state);
  console.log('   Redirect URL:', response.data.redirectUrl);
  
  return response.data;
}

// Step 3: Check Payment Status
async function checkPaymentStatus(accessToken, merchantOrderId) {
  const response = await axios.get(
    `${API_BASE}/checkout/v2/order/${merchantOrderId}/status`,
    {
      headers: {
        'Authorization': `O-Bearer ${accessToken}`
      }
    }
  );

  console.log('\n✅ Payment Status:');
  console.log('   State:', response.data.state);
  console.log('   Amount:', response.data.amount);
  
  return response.data;
}

// Run the test
async function runTest() {
  try {
    console.log('🚀 Testing PhonePe v2 API Integration\n');
    console.log('Merchant:', CLIENT_ID);
    console.log('API:', API_BASE);
    console.log('---\n');

    // Step 1: Get token
    const token = await getAccessToken();

    // Step 2: Create payment
    const payment = await createPayment(token);

    // Step 3: Check status
    const status = await checkPaymentStatus(token, payment.orderId);

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nYour merchant credentials are VALID for v2 API.');
    console.log('The issue is that the current code uses v1 API.');
    console.log('\nNext step: Migrate PhonePe service to v2 API.');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
  }
}

runTest();
