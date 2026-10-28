"use strict";

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// common handler for all rate limit responses
const handler = (req, res) => {
  res.status(429).json({ error: "Too many requests. Please try again later." });
};

// auth endpoints: strict (login, register, reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// public endpoints: moderate (business list, business profile)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// authenticated endpoints: per-user keying
const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // use user id if authenticated, fall back to ip
    return req.user ? `user:${req.user.id}` : ipKeyGenerator(req);
  },
  handler,
});

// file upload endpoints: strict per-user
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? `upload:${req.user.id}` : ipKeyGenerator(req);
  },
  handler,
});

// global fallback limiter — applies to all api routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = {
  authLimiter,
  publicLimiter,
  authenticatedLimiter,
  uploadLimiter,
  globalLimiter,
};
