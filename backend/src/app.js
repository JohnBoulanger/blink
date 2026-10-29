"use strict";

const path = require("path");
const express = require("express");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const businessRoutes = require("./routes/businesses");
const positionTypeRoutes = require("./routes/positionTypes");
const jobRoutes = require("./routes/jobs");
const qualificationRoutes = require("./routes/qualifications");
const systemsRoutes = require("./routes/system");
const negotiationRoutes = require("./routes/negotiations");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimit");

const FRONTEND_URL = config.frontendUrl;

function create_app() {
  const app = express();

  // trust reverse proxy (railway, nginx) so rate limiting uses real client ip
  app.set("trust proxy", 1);

  // set up cors to allow requests from frontend
  app.use(
    cors({
      origin: FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // security headers — relax CSP so maplibre can load openfreemap tiles and run its worker
  // allow cross-origin resource loading so frontend can display uploaded files
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
          imgSrc: ["'self'", "data:", "blob:", "https://tiles.openfreemap.org"],
          connectSrc: [
            "'self'",
            "ws:",
            "wss:",
            "https://nominatim.openstreetmap.org",
            "https://tiles.openfreemap.org",
          ],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'", "blob:"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // parse json with size limit to prevent oversized payloads
  app.use(express.json({ limit: "1mb" }));

  // global rate limit fallback — api routes only, not static files
  app.use("/api", globalLimiter);

  // all api routes live under /api so they don't collide with frontend spa routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/businesses", businessRoutes);
  app.use("/api/position-types", positionTypeRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/qualifications", qualificationRoutes);
  app.use("/api/system", systemsRoutes);
  app.use("/api/negotiations", negotiationRoutes);

  // handle multer file size errors
  app.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large" });
    }
    next(err);
  });

  // serve uploaded files (avatars, resumes, qualification docs)
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // serve frontend static build in production (single-service deploy)
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));

  // spa fallback — send index.html for non-api GET requests so react router works
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/uploads") && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendDist, "index.html"), (err) => {
        if (err) next();
      });
    }
    next();
  });

  // route has no matches
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // catch unhandled errors so clients never see a stack trace
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    // keep client errors from body parsing (bad json, payload too large) as 4xx
    if (err.expose && err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

module.exports = { create_app };
