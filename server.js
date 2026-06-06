const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check first - before any routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'RemoteStreak is running',
    timestamp: new Date().toISOString()
  });
});

// Load routes with error catching
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Auth routes failed:', err.message);
}

try {
  const onboardingRoutes = require('./routes/onboarding');
  app.use('/api/onboarding', onboardingRoutes);
  console.log('✅ Onboarding routes loaded');
} catch (err) {
  console.error('❌ Onboarding routes failed:', err.message);
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ Dashboard routes loaded');
} catch (err) {
  console.error('❌ Dashboard routes failed:', err.message);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RemoteStreak server running on port ${PORT}`);
});

// Catch unhandled errors so app doesn't crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

module.exports = app;
