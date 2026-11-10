
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet());

// Frontend access
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "https://codepen.io,https://cdpn.io"
).split(",").map(origin => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed."));
  }
}));

app.use(express.json({ limit: "10kb" }));

// Rate limiting
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

// Home route
app.get("/", (req, res) => {
  res.json({
    name: "UBC Backend",
    message: "Universal Bet Converter server is running.",
    version: "1.0.0"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    server: "UBC",
    conversionEngine: "not_configured"
  });
});

// Conversion endpoint
app.post("/api/convert", (req, res) => {
  const { code, from, to } = req.body || {};

  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      error: "Please provide a booking code."
    });
  }

  if (code.trim().length > 500) {
    return res.status(400).json({
      error: "Booking code is too long."
    });
  }

  const supportedBooks = ["melbet", "1xbet"];

  if (
    !supportedBooks.includes(from) ||
    !supportedBooks.includes(to)
  ) {
    return res.status(400).json({
      error: "Unsupported bookmaker."
    });
  }

  if (from === to) {
    return res.status(400).json({
      error: "Choose two different bookmakers."
    });
  }

  // Real conversion engine will be added later.
  return res.status(501).json({
    error: "Conversion engine is not connected yet.",
    code: "ENGINE_NOT_CONFIGURED",
    source: from,
    destination: to
  });
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found."
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("UBC error:", err.message);

  res.status(500).json({
    error: "Internal server error."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`UBC server running on port ${PORT}`);
});
