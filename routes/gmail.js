const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { google } = require('googleapis');

const getOAuthClient = () => {
  const callbackUrl = process.env.APP_URL
    ? `${process.env.APP_URL.trim()}/api/gmail/callback`
    : 'https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/api/gmail/callback'

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

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Gmail routes are reachable', timestamp: new Date().toISOString() });
});

router.get('/test-uri', async (req, res) => {
  const callbackUrl = 'https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/api/gmail/callback'
  res.json({
    callback_url: callbackUrl,
    google_client_id: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT FOUND',
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET ? 'FOUND' : 'NOT FOUND'
  })
});

router.get('/connect', verifyToken, async (req, res) => {
  const callbackUrl = 'https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/api/gmail/callback'

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl
  );

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

  console.log('=== Gmail Connect ===')
  console.log('Callback URL being used:', callbackUrl)
  console.log('GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID)
  console.log('GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET)
  console.log('Full OAuth URL:', url)

  res.json({ url });
});

router.get('/callback', async (req, res) => {
  console.log('Gmail callback received')
  console.log('Query params:', req.query)
  console.log('Code:', req.query.code ? 'present' : 'missing')
  console.log('State (userId):', req.query.state)

  const callbackUrl = 'https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/api/gmail/callback'
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    console.log('Missing code or userId - redirecting to error')
    return res.redirect('https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/dashboard?gmail=error');
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl
    );
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', tokens ? 'yes' : 'no')
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    console.log('User email:', userInfo.email)

    const { error: upsertError } = await supabase
      .from('gmail_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        gmail_email: userInfo.email,
        connected_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.log('Upsert error:', upsertError)
    } else {
      console.log('Gmail token saved successfully')
    }

    res.redirect('https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/dashboard?gmail=connected');
  } catch (error) {
    console.error('Gmail callback error:', error.message);
    res.redirect('https://7b1fb97b-a071-4e3a-bf8e-54e97d032703-00-1p2nrmvk9uxhl.riker.replit.dev/dashboard?gmail=error');
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
