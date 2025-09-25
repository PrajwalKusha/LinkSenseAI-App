// Production configuration - safe to commit (no secrets)
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.OPENROUTER_API_KEY) {
  console.warn('⚠️  Missing required environment variables. Check your .env file or environment settings.');
}

module.exports = {
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: 'x-ai/grok-4-fast:free',
    baseUrl: 'https://openrouter.ai/api/v1'
  },
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};
