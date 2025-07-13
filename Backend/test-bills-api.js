// Simple test to verify Bills API endpoints
const BASE_URL = "http://localhost:3001/api/v1";

// Test function to check if the server is running
async function testBillsAPI() {
  try {
    console.log("Testing Bills API endpoints...");

    // Test endpoint availability (without authentication for now)
    const response = await fetch(`${BASE_URL}/bills`);
    console.log("Bills API endpoint response status:", response.status);

    if (response.status === 401) {
      console.log(
        "✅ Bills API endpoint is accessible (401 - Authentication required as expected)"
      );
    } else {
      console.log("❌ Unexpected response status:", response.status);
    }
  } catch (error) {
    console.error("❌ Error testing Bills API:", error.message);
  }
}

// Run the test
testBillsAPI();
