const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);

app.use("/api/paystack/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "RemoteStreak is running",
    timestamp: new Date().toISOString(),
  });
});

try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (err) {
  console.error("❌ Auth routes failed:", err.message);
}

try {
  const onboardingRoutes = require("./routes/onboarding");
  app.use("/api/onboarding", onboardingRoutes);
  console.log("✅ Onboarding routes loaded");
} catch (err) {
  console.error("❌ Onboarding routes failed:", err.message);
}

try {
  const dashboardRoutes = require("./routes/dashboard");
  app.use("/api/dashboard", dashboardRoutes);
  console.log("✅ Dashboard routes loaded");
} catch (err) {
  console.error("❌ Dashboard routes failed:", err.message);
}

try {
  const paystackRoutes = require("./routes/paystack");
  app.use("/api/paystack", paystackRoutes);
  console.log("✅ Paystack routes loaded");
} catch (err) {
  console.error("❌ Paystack routes failed:", err.message);
}

app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RemoteStreak server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  if (err.code === "EADDRINUSE") process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

module.exports = app;
