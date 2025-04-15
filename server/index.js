const { OpenAI } = require("openai");

const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your personal OpenAI API key to the .env file
});

const app = express();
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT
);

// Add middleware to parse incoming JSON requests
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from your frontend
  methods: ["GET", "POST", "OPTIONS", "DELETE"], // Add DELETE to allowed methods
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/login", (req, res) => {
  const redirectUri = process.env.REDIRECT;
  const clientId = process.env.CLIENT_ID;

  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile%20https://www.googleapis.com/auth/calendar`;
  res.redirect(loginUrl);
});

app.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No authorization code provided");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;

    const userInfoResponse = await fetch(
      `https://openidconnect.googleapis.com/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const userInfo = await userInfoResponse.json();

    console.log("User Info:", userInfo);
    // Redirect back to the frontend with the token
    res.redirect(
      `http://localhost:5173/auth?token=${accessToken}&userInfo=${JSON.stringify(
        userInfo
      )}`
    );
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/calendar", async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send("No token provided");
  }

  try {
    const calendarResponse = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!calendarResponse.data || !calendarResponse.data.items) {
      throw new Error("No calendar events found");
    }

    res.json(calendarResponse.data);
  } catch (error) {
    console.error("Error fetching calendar events:", error.message);
    res.status(500).send({
      error: "Error fetching calendar events",
      details: error.message,
    });
  }
});

app.post("/calendar/event", async (req, res) => {
  const { eventDetails } = req.body;
  // Extract just the token from the authorization header
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7) // Remove "Bearer " prefix
    : authHeader;

  console.log("Authorization header:", authHeader);
  console.log(
    "Token (after extraction):",
    token ? `${token.substring(0, 10)}...` : "No token"
  );
  console.log(
    "eventDetails:",
    JSON.stringify(eventDetails, null, 2).substring(0, 200) + "..."
  );

  if (!token || !eventDetails) {
    return res.status(400).send({
      error: "Missing token or event details",
      details:
        "Request must include both authorization token and event details",
    });
  }

  try {
    // Validate required fields
    if (!eventDetails.summary) {
      return res.status(400).send({
        error: "Missing required field",
        details: "Event summary (title) is required",
      });
    }

    if (
      !eventDetails.start ||
      (!eventDetails.start.dateTime && !eventDetails.start.date)
    ) {
      return res.status(400).send({
        error: "Missing required field",
        details: "Event start time is required (either dateTime or date)",
      });
    }

    if (
      !eventDetails.end ||
      (!eventDetails.end.dateTime && !eventDetails.end.date)
    ) {
      return res.status(400).send({
        error: "Missing required field",
        details: "Event end time is required (either dateTime or date)",
      });
    }

    console.log(
      "Sending to Google Calendar API:",
      JSON.stringify(eventDetails, null, 2)
    );

    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      eventDetails,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Now token is properly extracted
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Google API response:", response.data);
    res.status(200).send({ success: true, event: response.data });
  } catch (error) {
    console.error("Error adding event:", error.response?.data || error.message);
    console.error("Request details:", JSON.stringify(eventDetails, null, 2));

    // Provide more detailed error information
    let errorDetails = "Unknown error occurred";
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error(
        "Error response data:",
        JSON.stringify(error.response.data, null, 2)
      );
      errorDetails =
        error.response.data.error?.message ||
        JSON.stringify(error.response.data);
    } else if (error.message) {
      errorDetails = error.message;
    }

    res.status(error.response?.status || 500).send({
      error: "Failed to add event",
      details: errorDetails,
    });
  }
});

app.post("/calendar/freebusy", async (req, res) => {
  const { timeMin, timeMax, timeZone } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  console.log("token", token);
  if (!timeMin || !timeMax || !token) {
    return res.status(400).send("Missing required parameters or token");
  }

  try {
    const freeBusyResponse = await axios.post(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        timeMin,
        timeMax,
        timeZone: timeZone || "UTC", // Default to UTC if no timezone is provided
        items: [{ id: "primary" }], // Check the primary calendar
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).send({ success: true, freeBusy: freeBusyResponse.data });
  } catch (error) {
    console.error(
      "Error fetching free/busy information:",
      error.response?.data || error.message
    );
    res.status(500).send({
      error: "Failed to fetch free/busy information",
      details: error.response?.data || error.message,
    });
  }
});

app.post("/calendar/quickadd", async (req, res) => {
  const { text } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

  if (!text || !token) {
    return res.status(400).send("Missing event text or token");
  }

  try {
    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd",
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).send({ success: true, event: response.data });
  } catch (error) {
    console.error("Error in Quick Add:", error.response?.data || error.message);
    res.status(500).send({
      error: "Failed to add event via Quick Add",
      details: error.response?.data || error.message,
    });
  }
});

app.delete("/calendar/event/:eventId", async (req, res) => {
  console.log("hello");
  const eventId = req.params.eventId;

  console.log("testing", eventId);
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer token
  console.log("token", token);
  if (!token) {
    return res.status(401).send("Missing or invalid token");
  }

  try {
    // Call the Google Calendar API to delete the event
    const response = await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res
      .status(200)
      .send({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error(
      "Error deleting event:",
      error.response?.data || error.message
    );
    res.status(500).send({
      error: "Failed to delete event",
      details: error.response?.data || error.message,
    });
  }
});

app.post("/schedule/ai-suggest", async (req, res) => {
  const { freeSlots, eventDetails } = req.body;

  if (!freeSlots || !eventDetails) {
    return res.status(400).send("Missing free slots or event details");
  }

  try {
    // Create a prompt for the AI
    const prompt = `
      You are a scheduling assistant. Based on the following available time slots and event details, suggest the most optimal time to schedule the event:
      
      Available free slots: ${JSON.stringify(freeSlots)}
      Event details: Event name is ${
        eventDetails.summary
      }, Estimated duration is ${
      eventDetails.estimatedDuration
    } hours, and the deadline is ${
      eventDetails.deadline
    }. Make sure you consider the duration and deadline strictly.
      The preferred time is ${eventDetails.preferences.beforeOrAfter} ${
      eventDetails.preferences.timePreference
    }. Here is some extra context to help you make your decision: ${
      eventDetails.description || "No description provided"
    }.
      Ensure the suggested time fits within the free slots, accommodates the estimated duration, and is scheduled a reasonable time before the deadline if possible. Also do to schedule too late in the day unless specified. It is better to schedule an event the next day than schedule it too late. Try not to schedule an event too close to the current time unless the deadline is near. Be sure to schedule the time accordingly to the event name (like "cooking dinner should not be scheduled in the morning"). Schedule the date accordingly as well (If the event seems like a daily activity, schedule it on the same or next day). BE SMART WITH YOUR PLANNING. Respond only with the suggested time, in the format "YYYY-MM-DDTHH:mm:ssZ" and only suggest a time that is divisible by 15 minutes (like 2023-08-01T09:00:00Z or 2023-08-01T09:15:00Z or 2023-08-01T09:30:00Z or 2023-08-01T09:45:00Z). Do not include any explanation or additional text.`;
    console.log("prompt", prompt);
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful scheduling assistant.",
        },
        { role: "user", content: prompt },
      ],
    });
    const suggestion = response.choices[0].message.content.trim();

    console.log("AI Scheduling Suggestion:", suggestion);
    res.status(200).send({ success: true, suggestion });
  } catch (error) {
    console.error("Error with AI scheduling suggestion:", error.message);
    res.status(500).send({
      error: "Failed to generate AI scheduling suggestion",
      details: error.message,
    });
  }
});

app.post("/task/ai-suggest", async (req, res) => {
  const { history, askGPTInput, title } = req.body;
  const prompt = `You are a task assistant. The user is attempting to focus on ${title}. Your job is to be able to provide constructive advice for the user. Your responses should be short and direct. If the user seems to be getting off topic with their questions, try to get them back on topic. Do not take time answering questions that are not related to the topic of ${title}. The prior question and answer history may be provided if available. Here is the current question: ${askGPTInput}`;
  console.log(history, askGPTInput, title);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        ...history
          .map(([question, answer]) => [
            { role: "user", content: question },
            { role: "assistant", content: answer },
          ])
          .flat(),
        { role: "user", content: prompt },
      ],
    });

    const suggestion = response.choices[0].message.content.trim();

    // Send the full response back to the frontend
    res.status(200).send({ success: true, suggestion });
  } catch (error) {
    console.error("Error with AI suggestion:", error.message);
    res.status(500).send({
      error: "Failed to generate AI suggestion",
      details: error.message,
    });
  }
});

app.listen(8080, () => console.log("Server running on port 8080"));
