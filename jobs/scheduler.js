const cron = require('node-cron');
const { pollFeeds } = require('./rss-poller');

console.log('📅 Job scheduler initialised');

pollFeeds().catch(err => console.error('Initial RSS poll error:', err.message));

cron.schedule('0 * * * *', () => {
  console.log('⏰ Scheduled RSS poll triggered');
  pollFeeds().catch(err => console.error('Scheduled RSS poll error:', err.message));
});
