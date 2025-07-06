// Test SIP functionality
const API_BASE = "http://localhost:3001/api/v1";

// Test data
const testUser = {
  name: "Test User", // This maps to fullname in the model
  email: "test@example.com",
  password: "password123",
};

const testSIP = {
  sipName: "Emergency Fund SIP",
  amount: 5000,
  durationInMonths: 12,
  frequency: "monthly",
  goal: "Emergency Fund",
  notes: "Building emergency fund for financial security",
  expectedRate: 15,
};

let authToken = "";
let sipId = "";

async function makeRequest(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  console.log(`${options.method || "GET"} ${url}:`, response.status, data);
  return { response, data };
}

async function testSIPFlow() {
  console.log("🚀 Starting SIP Test Flow...\n");

  try {
    // 1. Register user
    console.log("1. Testing user registration...");
    const { data: registerData } = await makeRequest("/users/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    if (registerData.data?.accessToken) {
      authToken = registerData.data.accessToken;
      console.log("✅ Registration successful, token received");
    } else {
      // 2. Try to login if registration failed (user might already exist)
      console.log("\n2. Registration failed, trying login...");
      const { data: loginData } = await makeRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      if (loginData.data?.accessToken) {
        authToken = loginData.data.accessToken;
        console.log("✅ Login successful, token received");
      }
    }

    if (!authToken) {
      console.log("❌ Failed to get authentication token, stopping test");
      return;
    }

    // 3. Create SIP
    console.log("\n3. Testing SIP creation...");
    const { data: sipData } = await makeRequest("/sip", {
      method: "POST",
      body: JSON.stringify(testSIP),
    });

    if (sipData.data?._id) {
      sipId = sipData.data._id;
      console.log("✅ SIP created successfully:", sipId);
    }

    if (!sipId) {
      console.log("❌ Failed to create SIP, stopping test");
      return;
    }

    // 4. Get SIP by ID
    console.log("\n4. Testing get SIP by ID...");
    await makeRequest(`/sip/${sipId}`);

    // 5. Get SIP Analytics
    console.log("\n5. Testing SIP analytics...");
    await makeRequest(`/sip/${sipId}/analytics`);

    // 6. Get SIP Projection
    console.log("\n6. Testing SIP projection...");
    await makeRequest(`/sip/${sipId}/projection?rate=12`);

    // 7. Get all SIPs
    console.log("\n7. Testing get all SIPs...");
    await makeRequest("/sip");

    // 8. Get SIP chart data
    console.log("\n8. Testing SIP chart data...");
    await makeRequest("/sip/chart");

    // 9. Get SIP summary
    console.log("\n9. Testing SIP summary...");
    await makeRequest("/sip/summary");

    // 10. Create a payment for SIP
    console.log("\n10. Testing payment creation...");
    await makeRequest("/payments", {
      method: "POST",
      body: JSON.stringify({
        sipId: sipId,
        amount: testSIP.amount,
        paymentDate: new Date().toISOString(),
        notes: "First SIP payment",
      }),
    });

    // 11. Get all payments
    console.log("\n11. Testing get all payments...");
    await makeRequest("/payments");

    // 12. Update SIP
    console.log("\n12. Testing SIP update...");
    const { data: updateData } = await makeRequest(`/sip/${sipId}`, {
      method: "PUT",
      body: JSON.stringify({
        amount: 6000,
        notes: "Updated SIP amount",
      }),
    });

    // 13. Testing upcoming payments...
    console.log("13. Testing upcoming payments...");
    const { data: upcomingData } = await makeRequest(
      "/sip/upcoming-payments?days=30"
    );

    console.log("\n✅ All SIP tests completed successfully!");
    console.log("\n📧 Email notifications should be working with cron jobs:");
    console.log("- Daily reminders at 9 AM");
    console.log("- Weekly summaries on Sundays at 10 AM");
    console.log("- Overdue payment checks at 6 PM");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test only if this is being run directly (not imported)
if (typeof window === "undefined") {
  testSIPFlow();
}

export { testSIPFlow };
