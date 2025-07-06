import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api/v1";

const testEmailFunctionality = async () => {
  try {
    console.log("📧 Testing complete SIP email flow...\n");

    // Create a new user with proper email
    const userData = {
      name: "Email Test User", // Changed from fullname to name
      email: "hitec3314@gmail.com", // Valid email for testing
      password: "TestPassword123",
    };

    console.log("🔧 Creating test user...");

    try {
      const registerResponse = await axios.post(
        `${API_BASE_URL}/users/register`,
        userData
      );
      console.log("✅ User created successfully");
    } catch (regError) {
      if (regError.response?.data?.message?.includes("already exists")) {
        console.log("ℹ️ User already exists, proceeding with login...");
      } else {
        throw regError;
      }
    }

    // Login with the user
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: userData.email,
      password: userData.password,
    });

    const token = loginResponse.data.data.accessToken;
    console.log("✅ Login successful");
    console.log("📧 User email:", userData.email);

    // Create SIP to trigger email
    const sipData = {
      sipName: "Real Email Test SIP - Future Planning",
      amount: 20000,
      durationInMonths: 48,
      frequency: "monthly",
      goal: "Long-term wealth creation and financial independence",
      notes: "Testing actual email delivery with real email address",
      expectedRate: 14,
    };

    console.log("📊 Creating SIP to trigger email...");

    const sipResponse = await axios.post(`${API_BASE_URL}/sip`, sipData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ SIP created successfully!");
    console.log("📧 Email should be sent to:", userData.email);
    console.log("📝 SIP Details:");
    console.log(`   • Name: ${sipResponse.data.data.sipName}`);
    console.log(
      `   • Amount: ₹${sipResponse.data.data.amount.toLocaleString("en-IN")}`
    );
    console.log(
      `   • Duration: ${sipResponse.data.data.durationInMonths} months`
    );
    console.log(
      `   • Expected Maturity: ₹${sipResponse.data.data.expectedMaturityValue.toLocaleString(
        "en-IN"
      )}`
    );
    console.log(
      `   • Next Payment: ${new Date(
        sipResponse.data.data.nextPaymentDate
      ).toLocaleDateString()}`
    );

    console.log(
      "\n🎉 Test completed! Check your email inbox for the beautiful SIP creation notification!"
    );
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response ? error.response.data : error.message
    );
  }
};

testEmailFunctionality();
