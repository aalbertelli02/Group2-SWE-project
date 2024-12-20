import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connection.js";
import records from "./routes/record.js";
import authRoutes from "./routes/auth.js";

//notifs CHANGED
import path from "path";
import bodyParser from "body-parser";
import PushNotifications from "node-pushnotifications";
import { fileURLToPath } from 'url';

// Web Push Keys (replace with your actual keys) CHANGED
const publicVapidKey = "BBFPmJ3We2RjxJ1fbMFaznxyX1FvgDy0mrk2dWZFDQZBRGjbIKoL_gJj8NoVld4sCaZ3N-Tit6CSJaK5iwVAjQA";
const privateVapidKey = "oHeT0zuWP5JpifyeyxyScqnxp8sGF5NZ_i8Td7i8h9A";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

// Combined Middleware for database and notifs CHANGED
app.use(cors({ origin: "http://localhost:5173" })); // Allow frontend requests
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file; want to use __dirname so commonJS to ES workaround; https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __dirname = path.dirname(__filename); // get the name of the directory
app.use(express.static(path.join(__dirname, "../client/public"))); // Serve static files
app.use(express.json()); // JSON parsing
app.use(bodyParser.json()); // Body parser for notifications
app.use("/record", records);
app.use("/auth", authRoutes);

//Middleware just for database
//app.use(cors({ origin: 'http://localhost:5173' })); 
//app.use(express.json());
//app.use("/record", records);
//app.use("/auth", authRoutes);

// Web Push Notifications Setup CHANGED
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  
  const settings = {
    web: {
      vapidDetails: {
        subject: "mailto:ashleyemaurer@gmail.com", // Replace with your email
        publicKey: publicVapidKey,
        privateKey: privateVapidKey,
      },
      TTL: 2419200,
      contentEncoding: "aes128gcm",
      headers: {},
    },
    isAlwaysUseFCM: false,
  };

  // Send 201 - resource created
  const push = new PushNotifications(settings);

  // Create payload
  const payload = { title: "Notification from Gators on Track" };
  
  push.send(subscription, payload, (err, result) => {
    if (err) {
      console.error("Push Notification Error:", err);
      //res.status(500).json({ error: "Notification failed" });
    } else {
      console.log("Push Notification Result:", result);
      //res.status(201).json({ success: "Notification sent successfully" });
    }
  });
});



  mongoose.connect(process.env.ATLAS_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Test query to verify database location and collection
    const testUser = await mongoose.connection.db.collection('userinfo').findOne({ username: "user" });
    console.log("Test user found in userinfo collection:", testUser);
  })
  .catch(err => console.error("Database connection error:", err));

// Connect to the database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });

//CHANGED
app.get("/sw.js", (req, res) => res.sendFile(path.join(__dirname, "../client/public/sw.js")));
