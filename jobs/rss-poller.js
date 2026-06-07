const axios = require('axios');
const xml2js = require('xml2js');
const Anthropic = require('@anthropic-ai/sdk');
const supabase = require('../supabaseClient');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RSS_FEEDS = [
  'https://remoteok.com/remote-jobs.rss',
  'https://weworkremotely.com/remote-jobs.rss',
  'https://remotive.com/remote-jobs/rss',
  'https://himalayas.app/jobs/rss'
];

const parseRSS = async (url) => {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'RemoteStreak Job Poller/1.0' }
    });
    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
    const items = parsed?.rss?.channel?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.error(`RSS fetch error for ${url}:`, err.message);
    return [];
  }
};

const extractJob = (item) => {
  const title = item.title?._ || item.title || '';
  const company = item['dc:company'] || item.company || item.author || '';
  const description = item.description?._ || item.description || '';
  const url = item.link || item.guid?._ || item.guid || '';
  const datePosted = item.pubDate || item.updated || new Date().toISOString();
  return { title, company, description: description.replace(/<[^>]*>/g, '').substring(0, 2000), url, datePosted };
};

const screenWithClaude = async (title, description) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `Is this a remote virtual assistant, admin, executive assistant, appointment setter, social media, or project coordinator role? Reply only YES or NO.\n\nTitle: ${title}\nDescription: ${description.substring(0, 500)}`
      }]
    });
    const reply = message.content[0]?.text?.trim().toUpperCase();
    return reply === 'YES';
  } catch (err) {
    console.error('Claude screening error:', err.message);
    return false;
  }
};

const pollFeeds = async () => {
  console.log('🔍 RSS poller starting...');
  let saved = 0;
  let skipped = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`Fetching: ${feedUrl}`);
    const items = await parseRSS(feedUrl);
    console.log(`  Found ${items.length} items`);

    for (const item of items) {
      const job = extractJob(item);
      if (!job.url || !job.title) continue;

      const { data: existing } = await supabase
        .from('job_opportunities')
        .select('id')
        .eq('source_url', job.url)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const passed = await screenWithClaude(job.title, job.description);
      if (!passed) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('job_opportunities')
        .insert({
          title: job.title,
          company_name: job.company,
          description: job.description,
          application_email: null,
          source_tag: 'job_board',
          source_url: job.url,
          status: 'active',
          screening_passed: true
        });

      if (error) {
        console.error('Supabase insert error:', error.message);
      } else {
        saved++;
        console.log(`  ✅ Saved: ${job.title}`);
      }
    }
  }

  console.log(`🏁 RSS poll complete — saved: ${saved}, skipped: ${skipped}`);
};

module.exports = { pollFeeds };
