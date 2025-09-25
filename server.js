const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { extract } = require('@extractus/article-extractor');
const axios = require('axios');
const { nanoid } = require('nanoid');
const config = require('./config.production.js');

const app = express();
const PORT = config.server.port;

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Middleware
app.use(helmet());
// Configure CORS
app.use(cors({
  origin: ['https://link-sense-ai-app.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Resolve the public base URL for returned short links
function getBaseUrl(req) {
  const envBase = process.env.PUBLIC_BASE_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim()) {
    // Allow either full URL or bare host
    if (envBase.startsWith('http://') || envBase.startsWith('https://')) {
      return envBase.replace(/\/$/, '');
    }
    const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0] || (config.server.nodeEnv === 'production' ? 'https' : 'http');
    return `${proto}://${envBase.replace(/\/$/, '')}`;
  }
  const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0] || req.protocol || (config.server.nodeEnv === 'production' ? 'https' : 'http');
  const host = req.get('host');
  return `${proto}://${host}`;
}

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'client/build')));

// Utility function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Function to extract article content
async function extractArticleContent(url) {
  try {
    console.log(`Extracting content from: ${url}`);
    const article = await extract(url, {
      includeRawHTML: false,
      includeImages: false,
      includeLinks: false
    });
    
    if (!article || !article.content) {
      throw new Error('Could not extract article content');
    }
    
    return {
      title: article.title || 'Untitled',
      content: article.content,
      description: article.description || ''
    };
  } catch (error) {
    console.error('Article extraction error:', error);
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}

// Function to generate condensed summary from existing summary
async function generateCondensedSummary(existingSummary, title = '') {
  try {
    console.log('Generating condensed AI summary...');
    
    const prompt = `Please create a very concise, condensed version of the following summary. Make it perfect for quick sharing on social media or messaging apps. 

Requirements:
- Maximum 3-4 short bullet points
- Each point should be 1-2 sentences maximum
- Keep the most essential information only
- Make it engaging and easy to read
- Use simple language

Original summary to condense:
${existingSummary}

Format as:
• [Concise point 1]
• [Concise point 2]  
• [Concise point 3]
• [Concise point 4 if needed]`;

    const response = await axios.post(
      `${config.openRouter.baseUrl}/chat/completions`,
      {
        model: config.openRouter.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openRouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://linksenseai.com',
          'X-Title': 'LinkSense AI'
        }
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from AI service');
    }

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Condensed AI summary error:', error.response?.data || error.message);
    // Fallback to simple truncation if AI fails
    return existingSummary
      .split('• ')
      .filter(item => item.trim())
      .slice(0, 3)
      .map(item => {
        const title = item.split(':')[0]?.replace(/\*\*(.*?)\*\*/g, '$1').trim() || '';
        return `• ${title}`;
      })
      .join('\n');
  }
}

// Function to generate AI summary
async function generateSummary(articleText, title = '') {
  try {
    console.log('Generating AI summary...');
    
    const prompt = `Please analyze the following article and provide a comprehensive summary using bullet points. Based on the content depth and importance, decide on the optimal number of points (minimum 3, maximum 10). Each bullet point should start with a **bold title** followed by a colon and detailed explanation.

Guidelines:
- For simple articles: 3-5 points
- For complex articles: 6-8 points  
- For very comprehensive content: up to 10 points
- Focus on the most important insights, actionable takeaways, and core messages
- Make each point informative and actionable
- Use **bold formatting** only for the titles at the start of each bullet point

Format your response EXACTLY as:
• **Key Point Title**: Detailed explanation of the insight or takeaway
• **Second Point Title**: Detailed explanation of the second insight
• **Additional Point Title**: Continue as needed based on content depth

Title: ${title}
Article text: ${articleText.substring(0, 6000)}`;

    const response = await axios.post(
      `${config.openRouter.baseUrl}/chat/completions`,
      {
        model: config.openRouter.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openRouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://linksenseai.com',
          'X-Title': 'LinkSense AI'
        }
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from AI service');
    }

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI summary error:', error.response?.data || error.message);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

// Function to generate short code
function generateShortCode() {
  return nanoid(6); // Generate 6-character random string
}

// API endpoint to shorten URL and generate summary
app.post('/api/shorten', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate input
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Processing URL: ${url}`);

    // Check if URL already exists in database
    const { data: existingUrl, error: checkError } = await supabase
      .from('shortened_urls')
      .select('*')
      .eq('original_url', url)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUrl) {
      console.log('URL already exists, returning existing data');
      const baseUrl = getBaseUrl(req);
      
      return res.json({
        shortCode: existingUrl.id,
        shortUrl: `${baseUrl}/${existingUrl.id}`,
        originalUrl: existingUrl.original_url,
        summary: existingUrl.summary,
        title: existingUrl.title
      });
    }

    // Extract article content
    const articleData = await extractArticleContent(url);
    
    // Generate AI summary
    const summary = await generateSummary(articleData.content, articleData.title);
    
    // Generate short code
    const shortCode = generateShortCode();
    
    // Store in database
    const { data, error } = await supabase
      .from('shortened_urls')
      .insert([
        {
          id: shortCode,
          original_url: url,
          summary: summary,
          title: articleData.title,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({ error: 'Failed to save URL' });
    }

    console.log(`Successfully processed URL with short code: ${shortCode}`);
    const baseUrl = getBaseUrl(req);

    res.json({
      shortCode: shortCode,
      shortUrl: `${baseUrl}/${shortCode}`,
      originalUrl: url,
      summary: summary,
      title: articleData.title
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Failed to process URL',
      details: error.message 
    });
  }
});

// Summary display endpoint - shows our summary page or redirects based on query param
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { redirect } = req.query;

    // Validate short code format
    if (!/^[A-Za-z0-9_-]{6}$/.test(shortCode)) {
      return res.status(404).send('Invalid short code format');
    }

    // Look up URL in database
    const { data, error } = await supabase
      .from('shortened_urls')
      .select('*')
      .eq('id', shortCode)
      .single();

    if (error || !data) {
      console.log(`Short code not found: ${shortCode}`);
      return res.status(404).send('Short URL not found');
    }

    // If redirect parameter is present, redirect to original URL
    if (redirect === 'true') {
      console.log(`Redirecting ${shortCode} to ${data.original_url}`);
      res.redirect(301, data.original_url);
      return;
    }

    // Otherwise, serve the React app with the summary data
    console.log(`Displaying summary page for ${shortCode}`);
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));

  } catch (error) {
    console.error('Summary display error:', error);
    res.status(500).send('Server error');
  }
});

// API endpoint to get summary data
app.get('/api/summary/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Validate short code format
    if (!/^[A-Za-z0-9_-]{6}$/.test(shortCode)) {
      return res.status(404).json({ error: 'Invalid short code format' });
    }

    // Look up URL in database
    const { data, error } = await supabase
      .from('shortened_urls')
      .select('*')
      .eq('id', shortCode)
      .single();

    if (error || !data) {
      console.log(`Short code not found: ${shortCode}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Return summary data
    res.json({
      shortCode: data.id,
      originalUrl: data.original_url,
      summary: data.summary,
      title: data.title,
      createdAt: data.created_at
    });

  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get condensed summary
app.post('/api/condensed-summary', async (req, res) => {
  try {
    const { summary, title } = req.body;

    if (!summary) {
      return res.status(400).json({ error: 'Summary is required' });
    }

    console.log('Generating condensed summary...');
    const condensedSummary = await generateCondensedSummary(summary, title);

    res.json({
      condensedSummary: condensedSummary
    });

  } catch (error) {
    console.error('Condensed summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate condensed summary',
      details: error.message 
    });
  }
});

// Direct redirect endpoint (for when users want to go to original URL)
app.get('/redirect/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Look up URL in database
    const { data, error } = await supabase
      .from('shortened_urls')
      .select('original_url')
      .eq('id', shortCode)
      .single();

    if (error || !data) {
      return res.status(404).send('Short URL not found');
    }

    // Redirect to original URL
    console.log(`Redirecting ${shortCode} to ${data.original_url}`);
    res.redirect(301, data.original_url);

  } catch (error) {
    console.error('Redirection error:', error);
    res.status(500).send('Server error');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`LinkSense AI server running on port ${PORT}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
});

module.exports = app;
