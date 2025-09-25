# LinkSense AI - Deployment Guide

This guide covers deploying LinkSense AI to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase database set up with the `shortened_urls` table
- ✅ OpenRouter API key for Grok model access
- ✅ Domain name (if using custom domain)

## Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Note your project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy and paste the contents of `database-setup.sql`
   - Execute the SQL to create tables and policies

## Platform-Specific Deployment

### 1. Vercel (Recommended)

Vercel is ideal for full-stack React applications.

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Build the client: `npm run build`
3. Deploy: `vercel --prod`
4. Configure environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL=x-ai/grok-beta`

**Vercel Configuration (`vercel.json`):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/[a-zA-Z0-9_-]{6}",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

### 2. Railway

**Steps:**
1. Connect your GitHub repository to Railway
2. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL=x-ai/grok-beta`
   - `PORT=3001`
3. Deploy automatically on push

### 3. Render

**Steps:**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables in dashboard

### 4. Heroku

**Steps:**
1. Install Heroku CLI
2. Create app: `heroku create linksense-ai`
3. Add environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set OPENROUTER_API_KEY=your_key
   heroku config:set OPENROUTER_MODEL=x-ai/grok-beta
   ```
4. Deploy: `git push heroku main`

## Custom Domain Setup

### For linksenseai.com

1. **DNS Configuration**
   - Point your domain to your hosting provider
   - For Vercel: Add CNAME record pointing to `cname.vercel-dns.com`
   - For other providers: Follow their specific DNS instructions

2. **SSL Certificate**
   - Most platforms (Vercel, Netlify, Railway) provide automatic SSL
   - Ensure HTTPS redirect is enabled

3. **Domain Verification**
   - Add domain in your hosting platform dashboard
   - Verify ownership through DNS or file upload

## Environment Variables

Create these environment variables on your hosting platform:

```bash
# Supabase Configuration
SUPABASE_URL=https://emcskqwktddgindppfwz.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter Configuration  
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=x-ai/grok-beta

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Build Commands

**For most platforms:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Node Version: 18.x or higher

## Monitoring and Analytics

### 1. Basic Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Track error rates

### 2. Analytics
- Add Google Analytics to track usage
- Monitor click-through rates on shortened URLs
- Track popular domains being shortened

### 3. Logging
- Configure structured logging
- Monitor API usage and errors
- Set up alerts for high error rates

## Security Considerations

### 1. Rate Limiting
- Current: 100 requests per 15 minutes per IP
- Adjust based on usage patterns
- Consider implementing user-based limits

### 2. Input Validation
- URL validation is implemented
- Consider adding domain blacklists
- Implement CAPTCHA for high-volume usage

### 3. Database Security
- Row Level Security (RLS) is enabled
- Monitor for unusual access patterns
- Regular security audits

## Performance Optimization

### 1. Caching
- Implement Redis for frequently accessed URLs
- Cache AI summaries to avoid regeneration
- Use CDN for static assets

### 2. Database Optimization
- Add indexes for frequently queried columns
- Monitor query performance
- Consider read replicas for high traffic

### 3. API Optimization
- Implement request queuing for AI processing
- Add timeout handling for external APIs
- Consider batch processing for multiple URLs

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase URL and API key
   - Check network connectivity
   - Ensure database is not paused

2. **AI API Failures**
   - Verify OpenRouter API key
   - Check model availability
   - Implement fallback summaries

3. **Article Extraction Issues**
   - Some websites block scraping
   - Implement user-agent rotation
   - Add fallback extraction methods

### Logs and Debugging

- Enable detailed logging in production
- Monitor error rates and response times
- Set up alerts for critical failures

## Scaling Considerations

### Traffic Growth
- Monitor database connection limits
- Consider implementing connection pooling
- Plan for horizontal scaling

### Cost Management
- Monitor API usage costs (OpenRouter)
- Optimize database queries
- Implement usage analytics

## Backup and Recovery

### Database Backups
- Supabase provides automatic backups
- Consider additional backup strategies
- Test recovery procedures

### Application Recovery
- Maintain deployment rollback capability
- Document recovery procedures
- Test disaster recovery plans

---

For additional support or questions, refer to the main README.md or create an issue in the repository.
