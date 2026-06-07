const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { google } = require('googleapis');

const getOAuthClient = () => {
  const callbackUrl = process.env.APP_URL
    ? `${process.env.APP_URL.trim()}/api/gmail/callback`
    : 'https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev:3000/api/gmail/callback'

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl
  );
};

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });
  req.user = data.user;
  next();
};

router.get('/connect', verifyToken, async (req, res) => {
  const oauth2Client = getOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: req.user.id
  });
  res.json({ url });
});

router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) {
    return res.redirect(`${process.env.APP_URL}/dashboard?gmail=error`);
  }
  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        gmail_email: userInfo.email,
        connected_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    res.redirect(`${process.env.APP_URL}/dashboard?gmail=connected`);
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect(`${process.env.APP_URL}/dashboard?gmail=error`);
  }
});

router.get('/status', verifyToken, async (req, res) => {
  const { data } = await supabase
    .from('gmail_tokens')
    .select('gmail_email, connected_at')
    .eq('user_id', req.user.id)
    .single();
  res.json({
    connected: !!data,
    email: data?.gmail_email || null,
    connected_at: data?.connected_at || null
  });
});

module.exports = router;
