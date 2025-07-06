const API_BASE = "http://localhost:3001/api/v1";

async function testNewSIPFeatures() {
  console.log("🧪 Testing new SIP features...\n");

  try {
    // Login first
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    if (!loginData.data?.accessToken) {
      console.error("❌ Login failed");
      return;
    }

    const token = loginData.data.accessToken;
    console.log("✅ Login successful");

    // Test creating SIP with new fields
    const newSIP = {
      sipName: "Retirement Fund SIP",
      amount: 10000,
      durationInMonths: 24,
      frequency: "monthly",
      goal: "Retirement Planning",
      notes: "Long-term retirement planning",
      expectedRate: 18,
    };

    const createResponse = await fetch(`${API_BASE}/sip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newSIP),
    });

    const createData = await createResponse.json();
    console.log(
      "📝 SIP Creation Response:",
      JSON.stringify(createData, null, 2)
    );

    if (createData.data?._id) {
      const sipId = createData.data._id;

      // Test getting the SIP back
      const getResponse = await fetch(`${API_BASE}/sip/${sipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const getData = await getResponse.json();
      console.log("📊 Retrieved SIP:", JSON.stringify(getData, null, 2));

      // Test upcoming payments
      const upcomingResponse = await fetch(
        `${API_BASE}/sip/upcoming-payments?days=30`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const upcomingData = await upcomingResponse.json();
      console.log(
        "⏰ Upcoming Payments:",
        JSON.stringify(upcomingData, null, 2)
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testNewSIPFeatures();
