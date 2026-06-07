const supabase = require('../supabaseClient');

const normalise = (str) => (str || '').toLowerCase();

const containsAny = (text, terms) => {
  if (!terms || terms.length === 0) return false;
  const t = normalise(text);
  return terms.some(term => t.includes(normalise(term)));
};

const calculateScore = (job, prefs, strengthProfile) => {
  const title = normalise(job.title);
  const description = normalise(job.description || '');
  const combined = `${title} ${description}`;

  const excludedKeywords = prefs?.excluded_keywords || [];
  if (containsAny(combined, excludedKeywords)) return 0;

  let score = 0;

  const targetKeywords = prefs?.target_keywords || [];
  if (containsAny(combined, targetKeywords)) score += 50;

  const targetRoleTypes = prefs?.target_role_types || [];
  if (containsAny(combined, targetRoleTypes)) score += 40;

  const strengthTags = strengthProfile?.strength_tags || [];
  if (containsAny(combined, strengthTags)) score += 30;

  return Math.min(score, 100);
};

const findMatchesForUser = async (userId) => {
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('id, subscription_status, user_preferences, strength_profile')
    .eq('id', userId)
    .single();

  if (userErr || !user) {
    console.error('Matcher: user fetch error', userErr?.message);
    return [];
  }

  if (user.subscription_status !== 'active') return [];

  const { data: jobs, error: jobsErr } = await supabase
    .from('job_opportunities')
    .select('id, title, description, company_name, source_url, source_tag')
    .eq('status', 'active')
    .eq('screening_passed', true);

  if (jobsErr || !jobs) {
    console.error('Matcher: jobs fetch error', jobsErr?.message);
    return [];
  }

  const { data: existingApps } = await supabase
    .from('applications')
    .select('opportunity_id')
    .eq('user_id', userId);

  const appliedIds = new Set((existingApps || []).map(a => a.opportunity_id));

  const matches = [];

  for (const job of jobs) {
    if (appliedIds.has(job.id)) continue;

    const score = calculateScore(job, user.user_preferences, user.strength_profile);
    if (score >= 65) {
      matches.push({
        user_id: userId,
        opportunity_id: job.id,
        match_score: score,
        opportunity: {
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          source_url: job.source_url,
          source_tag: job.source_tag
        }
      });
    }
  }

  return matches;
};

const findMatchesForAllUsers = async () => {
  const { data: subscribers, error } = await supabase
    .from('users')
    .select('id, subscription_status, user_preferences, strength_profile')
    .eq('subscription_status', 'active');

  if (error || !subscribers) {
    console.error('Matcher: subscribers fetch error', error?.message);
    return [];
  }

  const { data: jobs, error: jobsErr } = await supabase
    .from('job_opportunities')
    .select('id, title, description, company_name')
    .eq('status', 'active')
    .eq('screening_passed', true);

  if (jobsErr || !jobs) {
    console.error('Matcher: jobs fetch error', jobsErr?.message);
    return [];
  }

  const { data: allApps } = await supabase
    .from('applications')
    .select('user_id, opportunity_id');

  const appliedSet = new Set((allApps || []).map(a => `${a.user_id}:${a.opportunity_id}`));

  const allMatches = [];

  for (const user of subscribers) {
    for (const job of jobs) {
      if (appliedSet.has(`${user.id}:${job.id}`)) continue;

      const score = calculateScore(job, user.user_preferences, user.strength_profile);
      if (score >= 65) {
        allMatches.push({
          user_id: user.id,
          opportunity_id: job.id,
          match_score: score
        });
      }
    }
  }

  return allMatches;
};

module.exports = { findMatchesForUser, findMatchesForAllUsers };
