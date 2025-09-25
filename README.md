# LinkSense AI

A modern URL shortener with AI-powered content summarization.

## Features

- URL Shortening with custom short codes
- AI-powered content summarization using Grok
- Clean, modern UI with glass morphism design
- Full and condensed summary options
- Mobile-responsive design

## Tech Stack

- Frontend: React.js
- Backend: Node.js + Express
- Database: Supabase
- AI: OpenRouter (Grok-4)
- Content Extraction: @extractus/article-extractor
- Deployment: Vercel (Frontend) + Render (Backend)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/LinkSenseAI-App.git
cd LinkSenseAI-App
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. Create configuration files:
- Copy `config.example.js` to `config.js`
- Add your API keys and configuration

4. Start the development servers:
```bash
# Start backend (from root directory)
npm run server

# Start frontend (in another terminal)
cd client
npm start
```

## Environment Variables

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `PUBLIC_BASE_URL`: Your production domain (e.g., https://linksenseai.com)

## Deployment

The application is deployed to:
- Frontend: Vercel
- Backend: Render
- Database: Supabase

## Author

**Prajwal Kusha**
- LinkedIn: [Prajwal Kusha](https://linkedin.com/in/prajwal-kusha)
- Contact: p.kusha@gwu.edu