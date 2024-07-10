const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const uuid = require("uuid"); // Example library for generating UUIDs
const VoiceResponse = require("twilio");

const app = express();
const port = process.env.PORT || 3002;

// Twilio credentials
const accountSid = "AC685ee4ca81febfb3df4974b3160a85f8";
const authToken = "c30ab9f2331c58a922e38ea1d91bc997";

const apiKeySid = "SKf257452d738661f913fbfb75e932a2ac"; // Replace with your API Key SID
const apiKeySecret = "Ig24oWlpQykIsFWd64KjVaP5c35BXw4d";

const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
//=====================

// Generate Twilio access token with user identity
app.get("/api/token", (req, res) => {
  try {
    // Extract user identity from request (e.g., from JWT or custom header)
    const userIdentity = req.headers["x-user-id"] || uuid.v4(); // Example using UUID if no specific user ID is provided

    // Create access token
    const accessToken = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: userIdentity,
    });

    // Grant access to Twilio Voice capabilities
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: "AP08ed51304b77729c260de04e7e764e19", // Replace with your Twilio Voice Application SID
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);
    accessToken.ttl = 3600;
    // Respond with the token
    res.json({
      token: accessToken.toJwt(),
      identity: userIdentity,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
