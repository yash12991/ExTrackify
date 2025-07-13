import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api/v1";

const testSIPEmailCreation = async () => {
  try {
    console.log("🧪 Testing SIP creation with email notification...");

    // First login to get token
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: "test@example.com",
      password: "password123",
    });

    const token = loginResponse.data.data.accessToken;
    console.log("✅ Login successful");

    // Create a test SIP
    const sipData = {
      sipName: "Email Test SIP - Wealth Building",
      amount: 15000,
      durationInMonths: 36,
      frequency: "monthly",
      goal: "Building wealth for future dreams",
      notes: "Testing email notification system for SIP creation",
      expectedRate: 15,
    };

    const sipResponse = await axios.post(`${API_BASE_URL}/sip`, sipData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📧 SIP Creation Response (Email should be sent):");
    console.log(JSON.stringify(sipResponse.data, null, 2));

    console.log(
      "✅ Test completed! Check your email for the SIP creation notification."
    );
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response ? error.response.data : error.message
    );
  }
};

testSIPEmailCreation();
