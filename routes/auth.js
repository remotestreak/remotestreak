const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// SIGNUP
router.post("/signup", async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({
      error: "Email, password and full name are required",
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (error) throw error;

    // Create user profile in users table
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: email,
      full_name: full_name,
      tier: "streak_starter",
      subscription_status: "inactive",
      credit_balance: 0,
      linkedin_url: "pending",
    });

    if (profileError) throw profileError;

    res.json({
      message: "Account created successfully",
      user: data.user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json({
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/google-user', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email,
        tier: 'streak_starter',
        subscription_status: 'inactive',
        credit_balance: 0,
        linkedin_url: 'pending'
      }, { onConflict: 'id' });
    
    if (upsertError) throw upsertError;
    
    res.json({ success: true, user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET CURRENT USER
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    res.json({ user: data.user, profile });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
