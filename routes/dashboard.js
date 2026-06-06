const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Middleware to verify user token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  next();
};

// GET DASHBOARD DATA
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Get strength profile
    const { data: strength } = await supabase
      .from('strength_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get agent vault
    const { data: vault } = await supabase
      .from('agent_vault')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get applications
    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(20);

    // Get streak
    const { data: streak } = await supabase
      .from('streak_counters')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate agent strength score
    let agentStrength = 0;
    if (profile?.linkedin_url) agentStrength += 20;
    if (strength?.primary_strength) agentStrength += 30;
    if (vault?.cv_pdf_path || vault?.cv_drive_link) agentStrength += 20;
    if (vault?.video_link) agentStrength += 20;
    if (vault?.portfolio_url) agentStrength += 10;

    res.json({
      profile,
      strength,
      vault,
      applications: applications || [],
      streak: streak || { current_streak: 0 },
      agent_strength: agentStrength,
      credits_remaining: profile?.credit_balance || 0
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
