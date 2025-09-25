# LinkSense AI

A modern, intelligent URL shortener with AI-powered content summarization. Built with React, Node.js, Express, and integrated with Supabase and OpenRouter's Grok AI model.

<img width="2563" height="1352" alt="Screenshot 2025-09-25 at 3 22 00 PM" src="https://github.com/user-attachments/assets/0de00769-5f4e-47c5-a13f-634f46b7bce8" />

## Features

- 🔗 **URL Shortening**: Generate short, memorable URLs
- 🤖 **AI Summarization**: Automatic content summarization using Grok AI
- 📱 **Responsive Design**: Beautiful, mobile-first UI
- ⚡ **Fast & Reliable**: Built with modern web technologies
- 🔒 **Secure**: Rate limiting and input validation
- 📊 **Analytics Ready**: Click tracking capabilities

<img width="2555" height="1351" alt="Screenshot 2025-09-25 at 3 21 30 PM" src="https://github.com/user-attachments/assets/c0489381-fa34-44a6-be79-4f813f1c0a7a" />
<img width="2558" height="1354" alt="Screenshot 2025-09-25 at 3 21 42 PM" src="https://github.com/user-attachments/assets/39a121c0-8ad1-44d6-8c78-df566d604a9e" />

## Tech Stack

### Frontend
- React 18
- Modern CSS with gradients and animations
- Lucide React icons
- Responsive design

### Backend
- Node.js & Express
- Supabase (PostgreSQL database)
- OpenRouter API (Grok AI model)
- Article content extraction
- Rate limiting and security

### External Services
- **Supabase**: Database and authentication
- **OpenRouter**: AI summarization via Grok model
- **@extractus/article-extractor**: Intelligent content extraction

## Project Structure

```
URL_Shortener/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json
├── server.js              # Express server
├── config.js              # Configuration
├── database-setup.sql     # Database schema
├── package.json           # Backend dependencies
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### 2. Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Run the SQL commands in `database-setup.sql` in your Supabase SQL editor
3. Update the Supabase URL and API key in `config.js`

### 3. API Configuration

1. Get an API key from [OpenRouter](https://openrouter.ai)
2. Update the OpenRouter API key in `config.js`

### 4. Run the Application

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Production mode
npm run build
npm start
```

The application will be available at `http://localhost:3001`

## API Endpoints

### POST /api/shorten
Shortens a URL and generates an AI summary.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "shortCode": "abc123",
  "shortUrl": "https://linksenseai.com/abc123",
  "originalUrl": "https://example.com/article",
  "summary": "AI-generated summary of the article content...",
  "title": "Article Title"
}
```

### GET /:shortCode
Redirects to the original URL.

### GET /api/health
Health check endpoint.

## Database Schema

```sql
CREATE TABLE shortened_urls (
    id VARCHAR(6) PRIMARY KEY,           -- Short code
    original_url TEXT NOT NULL,         -- Original URL
    summary TEXT NOT NULL,              -- AI-generated summary
    title TEXT,                         -- Article title
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    click_count INTEGER DEFAULT 0       -- Analytics
);
```

## Features in Detail

### 1. Intelligent Content Extraction
- Uses `@extractus/article-extractor` to intelligently extract main content
- Filters out navigation, ads, and boilerplate content
- Handles various article formats and websites

### 2. AI-Powered Summarization
- Integrates with OpenRouter's Grok AI model
- Generates concise, single-paragraph summaries
- Focuses on key takeaways and core messages

### 3. Modern UI/UX
- Clean, minimalist design
- Smooth animations and transitions
- Loading states and progress indicators
- Mobile-responsive layout
- Copy-to-clipboard functionality

### 4. Security & Performance
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Helmet.js for security headers
- CORS configuration
- Error handling and logging

## Deployment

The application is designed to be deployed on platforms like:
- **Vercel** (recommended for full-stack apps)
- **Netlify** (with serverless functions)
- **Railway** or **Render** (for traditional hosting)
- **Heroku** (with PostgreSQL add-on)

### Environment Variables for Production

Create a `.env` file with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=x-ai/grok-beta
PORT=3001
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔐 Security Setup

**⚠️ IMPORTANT: Never commit API keys to version control!**

### For Development:
1. Copy `config.example.js` to `config.js` and add your real API keys
2. Or use `.env.example` → `.env` with environment variables
3. The `.gitignore` file prevents these from being committed

### For Production:
- Use environment variables in your hosting platform
- Never hardcode API keys in your source code

### Files to keep secure:
- `config.js` (contains actual API keys)
- `.env` (environment variables)
- These are already in `.gitignore`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies and AI.
