// Configuration template for LinkSense AI
// Copy this file to config.js and fill in your actual API keys
// NEVER commit config.js to version control!

module.exports = {
  supabase: {
    url: 'YOUR_SUPABASE_URL_HERE',
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
  },
  openRouter: {
    apiKey: 'YOUR_OPENROUTER_API_KEY_HERE',
    model: 'x-ai/grok-4-fast:free',
    baseUrl: 'https://openrouter.ai/api/v1'
  },
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};
