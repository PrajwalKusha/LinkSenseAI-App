# LinkSense AI - Quick Start Guide

Get LinkSense AI running locally in under 5 minutes!

## 🚀 Quick Setup

### 1. Database Setup (2 minutes)
1. Go to [Supabase](https://supabase.com) → Create new project
2. Go to SQL Editor → Copy/paste contents of `database-setup.sql` → Run
3. Your database is ready! ✅

### 2. Start the Application (1 minute)
```bash
# Navigate to project directory
cd URL_Shortener

# Start both backend and frontend
npm run dev
```

**That's it!** 🎉

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🧪 Test It Out

1. Open http://localhost:3000
2. Enter a URL (e.g., `https://en.wikipedia.org/wiki/Artificial_intelligence`)
3. Click "Shorten & Summarize"
4. Get your shortened URL + AI summary!

## 📁 Project Structure

```
URL_Shortener/
├── client/           # React frontend (port 3000)
├── server.js         # Express backend (port 3001)
├── config.js         # API keys and configuration
├── database-setup.sql # Database schema
└── README.md         # Full documentation
```

## 🔑 API Keys Already Configured

✅ **Supabase**: Pre-configured and ready  
✅ **OpenRouter (Grok AI)**: Pre-configured and ready  
✅ **All dependencies**: Already installed

## 🌐 API Endpoints

- `POST /api/shorten` - Shorten URL + generate summary
- `GET /:shortCode` - Redirect to original URL
- `GET /api/health` - Health check

## 🛠️ Development Commands

```bash
npm run dev        # Start both frontend & backend
npm run server     # Backend only (with auto-reload)
npm run build      # Build for production
npm start          # Production server
```

## 🚨 Need Help?

- **Full documentation**: See `README.md`
- **Deployment guide**: See `DEPLOYMENT.md`
- **Server not starting?** Check if ports 3000/3001 are free
- **Database errors?** Verify you ran the SQL setup in Supabase

## 🎯 Key Features

- 🔗 **URL Shortening**: Generate short, memorable links
- 🤖 **AI Summaries**: Powered by Grok AI via OpenRouter
- 📱 **Responsive UI**: Beautiful, mobile-first design
- ⚡ **Fast**: Intelligent content extraction
- 🔒 **Secure**: Rate limiting and validation

---

**Ready to deploy?** Check out `DEPLOYMENT.md` for platform-specific guides!
