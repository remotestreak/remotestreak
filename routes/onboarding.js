const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Middleware to verify user token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });

  req.user = data.user;
  next();
};

// SAVE STEP 1 — Basics
router.post('/step1', verifyToken, async (req, res) => {
  const {
    linkedin_url,
    current_title,
    years_experience,
    target_role_types,
    timezone,
    contract_type,
    salary_min,
    salary_max,
    industries_to_avoid
  } = req.body;

  if (!linkedin_url) {
    return res.status(400).json({ 
      error: 'LinkedIn URL is required' 
    });
  }

  // Validate LinkedIn URL format
  if (!linkedin_url.includes('linkedin.com/in/')) {
    return res.status(400).json({ 
      error: 'Please enter a valid LinkedIn profile URL' 
    });
  }

  try {
    // Update user profile
    await supabase
      .from('users')
      .update({ linkedin_url })
      .eq('id', req.user.id);

    // Save preferences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: req.user.id,
        target_role_types,
        timezone,
        contract_type,
        salary_min,
        salary_max,
        excluded_keywords: industries_to_avoid || []
      });

    if (error) throw error;

    res.json({ 
      message: 'Step 1 saved successfully',
      agent_strength: 20
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// SAVE STEP 2 — Career Story + Trigger Strength Detection
router.post('/step2', verifyToken, async (req, res) => {
  const {
    daily_tools,
    main_tasks,
    hired_for,
    proudest_result,
    superpower,
    work_style,
    culture_fit
  } = req.body;

  if (!proudest_result || !superpower) {
    return res.status(400).json({ 
      error: 'Please fill in your proudest result and superpower' 
    });
  }

  try {
    // Run Claude Strength Detection
    const prompt = `
You are a career intelligence engine. Analyse this professional profile and extract structured insights.

Daily tools: ${daily_tools?.join(', ')}
Main tasks: ${main_tasks}
Most hired for: ${hired_for}
Proudest result: ${proudest_result}
Superpower: ${superpower}
Work style: ${work_style}
Culture preference: ${culture_fit}

Return ONLY valid JSON with these exact fields:
{
  "primary_strength": "one sentence pitch in first person using their proof points",
  "secondary_strength": "second strongest skill one sentence pitch",
  "proof_points": ["specific proof point 1", "specific proof point 2", "specific proof point 3"],
  "cold_pitch_angle": "single best angle to lead with in a cold email to a startup founder",
  "application_pitch_angle": "best angle for a formal job application cover email",
  "strength_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

No preamble. No explanation. Only JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const strengthData = JSON.parse(cleanJson);

    // Save strength profile
    const { error } = await supabase
      .from('strength_profiles')
      .upsert({
        user_id: req.user.id,
        primary_strength: strengthData.primary_strength,
        secondary_strength: strengthData.secondary_strength,
        proof_points: strengthData.proof_points,
        cold_pitch_angle: strengthData.cold_pitch_angle,
        application_pitch_angle: strengthData.application_pitch_angle,
        strength_tags: strengthData.strength_tags,
        raw_answers: {
          daily_tools,
          main_tasks,
          hired_for,
          proudest_result,
          superpower,
          work_style,
          culture_fit
        },
        generated_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({
      message: 'Step 2 saved and strength analysis complete',
      agent_strength: 50,
      strength_profile: strengthData
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
