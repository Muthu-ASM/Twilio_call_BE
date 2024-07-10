const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const uuid = require("uuid"); // Example library for generating UUIDs
const VoiceResponse = require("twilio");

const app = express();
const port = process.env.PORT || 3002;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

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
      outgoingApplicationSid: process.env.TWILIO_API_TWIML_SID, // Replace with your Twilio Voice Application SID
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
