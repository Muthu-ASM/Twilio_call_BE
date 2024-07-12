const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const uuid = require("uuid"); // Example library for generating UUIDs

const app = express();
const port = process.env.PORT || 3002;

// Twilio credentials
const accountSid = "";
const authToken = "";
const apiKeySid = "";
const apiKeySecret = "";

const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const client = twilio(accountSid, authToken);
const VoiceResponse = require("twilio").twiml.VoiceResponse;

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
      ttl: 3600,
    });

    // Grant access to Twilio Voice capabilities
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: "", // Replace with your Twilio Voice Application SID
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

app.get("/api/startRecording", async (req, res) => {
  res.type("xml");
  const twiml = new VoiceResponse();
  twiml.record();
  res.send(twiml.toString());
});

app.post("/api/fetchRecording", async (req, res) => {
  const { callSid } = req.body;

  try {
    const recordings = await client.calls(callSid).recordings.list();

    console.log("Recordings:", recordings);
    if (recordings && recordings.length > 0) {
      const recordingUrl = recordings[0].uri;
      res.json({ recordingUrl });
    } else {
      res.json({ recordingUrl: null });
    }
  } catch (error) {
    console.error("Error fetching recordings:", error);
    res.status(500).json({ error: "Failed to fetch recordings" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
