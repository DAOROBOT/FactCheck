/**
 * FactCheck Cloud Functions
 *
 * This file contains Firebase Cloud Functions for the FactCheck application.
 * Functions include user management, link processing, and automated tasks.
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require("express");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS configuration
const cors = require("cors")({
  origin: true,
  credentials: true
});

// Create Express app for API
const app = express();
app.use(cors);
app.use(express.json());

// Basic API routes for demo
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await db.collection("users")
      .where("email", "==", email.toLowerCase())
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      isVerified: true, // Skip email verification for demo
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        linksChecked: 0
      }
    };

    const userRef = await db.collection("users").add(userData);

    res.status(201).json({
      message: "Registration successful",
      userId: userRef.id
    });

  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userQuery = await db.collection("users")
      .where("email", "==", email.toLowerCase())
      .get();

    if (userQuery.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });

  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Link routes
app.post("/links/check", authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;

    // Simple URL validation
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Mock fact-check result
    const result = {
      url,
      userId: req.user.userId,
      status: "completed",
      credibilityScore: Math.floor(Math.random() * 100),
      summary: "This is a demo fact-check result. In production, this would contain real analysis.",
      sources: [
        { name: "Demo Source 1", url: "https://example.com/source1", credibility: "high" },
        { name: "Demo Source 2", url: "https://example.com/source2", credibility: "medium" }
      ],
      checkedAt: new Date().toISOString()
    };

    // Save to database
    const linkRef = await db.collection("links").add(result);

    res.json({
      id: linkRef.id,
      ...result
    });

  } catch (error) {
    logger.error("Link check error:", error);
    res.status(500).json({ error: "Failed to check link" });
  }
});

app.get("/links/history", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const linksQuery = await db.collection("links")
      .where("userId", "==", req.user.userId)
      .orderBy("checkedAt", "desc")
      .limit(parseInt(limit))
      .get();

    const links = linksQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: links.length
      }
    });

  } catch (error) {
    logger.error("History error:", error);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// User routes
app.get("/users/profile", authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const { password, ...userProfile } = userData;

    res.json({
      id: userDoc.id,
      ...userProfile
    });

  } catch (error) {
    logger.error("Profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

app.get("/users/dashboard", authenticateToken, async (req, res) => {
  try {
    // Get user stats
    const userDoc = await db.collection("users").doc(req.user.userId).get();
    const userData = userDoc.data();

    // Get recent links
    const recentLinksQuery = await db.collection("links")
      .where("userId", "==", req.user.userId)
      .orderBy("checkedAt", "desc")
      .limit(5)
      .get();

    const recentLinks = recentLinksQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      stats: userData.stats || { linksChecked: 0 },
      recentLinks
    });

  } catch (error) {
    logger.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "FactCheck API"
  });
});

// Export API function
exports.api = onRequest({
  cors: true,
  region: "us-central1"
}, app);

/**
 * HTTP Function: Health Check
 * Simple health check endpoint for monitoring
 */
exports.healthCheck = onRequest({
  cors: true,
  region: "us-central1"
}, (request, response) => {
  logger.info("Health check requested");
  response.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "FactCheck Functions"
  });
});

/**
 * Firestore Trigger: Update user stats when a link is checked
 * Automatically updates user statistics when a new link is added
 */
exports.updateUserStats = onDocumentCreated({
  document: "links/{linkId}",
  region: "us-central1"
}, async (event) => {
  try {
    const linkData = event.data.data();
    const userId = linkData.userId;

    logger.info(`Updating stats for user: ${userId}`);

    // Get user document
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error(`User not found: ${userId}`);
      return;
    }

    // Update user stats
    await userRef.update({
      "stats.linksChecked": admin.firestore.FieldValue.increment(1),
      "updatedAt": new Date().toISOString()
    });

    logger.info(`Successfully updated stats for user: ${userId}`);
  } catch (error) {
    logger.error("Error updating user stats:", error);
  }
});

/**
 * Scheduled Function: Clean up expired tokens
 * Runs daily to remove expired verification and password reset tokens
 */
exports.cleanupExpiredTokens = onSchedule({
  schedule: "0 2 * * *", // Run daily at 2 AM
  timeZone: "UTC",
  region: "us-central1"
}, async (event) => {
  try {
    logger.info("Starting cleanup of expired tokens");

    const now = new Date();
    const batch = db.batch();
    let deletedCount = 0;

    // Clean up verification tokens
    const expiredVerificationTokens = await db.collection("verification_tokens")
      .where("expiresAt", "<", now.toISOString())
      .get();

    expiredVerificationTokens.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // Clean up password reset tokens
    const expiredResetTokens = await db.collection("password_reset_tokens")
      .where("expiresAt", "<", now.toISOString())
      .get();

    expiredResetTokens.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // Execute batch delete
    await batch.commit();

    logger.info(`Cleanup completed. Deleted ${deletedCount} expired tokens`);
  } catch (error) {
    logger.error("Error during token cleanup:", error);
  }
});
