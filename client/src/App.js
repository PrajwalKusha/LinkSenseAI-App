import React, { useState, useEffect } from 'react';
import api from './api';
import { Link, Loader2, Sparkles, Copy, ExternalLink, CheckCircle, X, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryPage, setIsSummaryPage] = useState(false);
  const [isGeneratingCondensed, setIsGeneratingCondensed] = useState(false);

  // Check if we're on a summary page
  useEffect(() => {
    const path = window.location.pathname;
    const shortCodeMatch = path.match(/^\/([A-Za-z0-9_-]{6})$/);
    
    if (shortCodeMatch) {
      const shortCode = shortCodeMatch[1];
      setIsSummaryPage(true);
      fetchSummaryData(shortCode);
    }
  }, []);

  const fetchSummaryData = async (shortCode) => {
    try {
      const response = await api.get(`/api/summary/${shortCode}`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setError('Summary not found');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/api/shorten', { url: url.trim() });
      setResult(response.data);
      setUrl(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.details || 
        'Failed to process URL. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.shortUrl) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleNewUrl = () => {
    setResult(null);
    setError('');
    setUrl('');
    setResultCopied(false);
  };

  const handleCopyResult = () => {
    setShowCopyDialog(true);
  };

  const handleCopyOption = async (type) => {
    if (!result) return;
    
    try {
      let formattedResult;
      if (type === 'full') {
        formattedResult = formatResultForSharing(result, false);
      } else {
        // Generate condensed summary using AI
        setIsGeneratingCondensed(true);
        console.log('Generating condensed summary...');
        const condensedResponse = await api.post('/api/condensed-summary', {
          summary: result.summary,
          title: result.title
        });
        
        const condensedSummary = condensedResponse.data.condensedSummary;
        formattedResult = formatResultForSharing({
          ...result,
          summary: condensedSummary
        }, true);
        setIsGeneratingCondensed(false);
      }
      
      await navigator.clipboard.writeText(formattedResult);
      setResultCopied(true);
      setShowCopyDialog(false);
      setTimeout(() => setResultCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy result:', error);
      // Fallback to simple condensed version if AI fails
      const formattedResult = formatResultForSharing(result, true);
      await navigator.clipboard.writeText(formattedResult);
      setResultCopied(true);
      setShowCopyDialog(false);
      setTimeout(() => setResultCopied(false), 2000);
    }
  };

  const formatResultForSharing = (result, isCondensed = false) => {
    if (!result) return '';
    
    // Clean up the summary text for plain text sharing
    const summaryPoints = result.summary
      .split('• ')
      .filter(item => item.trim())
      .map((item, index) => {
        // Remove **bold** formatting and clean up text
        const cleanItem = item.replace(/\*\*(.*?)\*\*/g, '$1').trim();
        
        if (isCondensed) {
          // For condensed version, extract just the key title and make it very short
          const title = cleanItem.split(':')[0] || cleanItem.split('.')[0] || cleanItem;
          return `• ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`;
        } else {
          // For full version, use complete text
          return `${index + 1}. ${cleanItem}`;
        }
      });

    const summaryText = isCondensed 
      ? summaryPoints.join('\n')
      : summaryPoints.join('\n\n');

    const header = isCondensed ? '📝 Quick Summary:' : '📝 Key Takeaways:';
    
    // Create URLs for both summary and original article
    const summaryUrl = result.shortUrl;
    // Use the original URL directly for reading the full article
    const originalUrl = result.originalUrl;
    
    return `📄 ${result.title || 'Article Summary'}

${header}

${summaryText}

🔗 Read full summary: ${summaryUrl}
📖 Read original article: ${originalUrl}

---
Powered by LinkSense AI ✨`;
  };

  // Format summary text for better display
  const formatSummary = (text) => {
    if (!text) return '';
    
    return text
      // Split by bullet points and filter empty items
      .split('• ')
      .filter(item => item.trim())
      .map((item, index) => {
        // Split the item into title and content
        const parts = item.split(':');
        const title = parts[0]?.replace(/\*\*(.*?)\*\*/g, '$1').trim() || '';
        const content = parts.slice(1).join(':').trim() || '';
        
        return `
          <div class="summary-point">
            <div class="summary-point-header">
              <div class="summary-point-number">${index + 1}</div>
              <strong>${title}</strong>
            </div>
            ${content ? `<div class="summary-point-content">${content}</div>` : ''}
          </div>
        `;
      })
      .join('');
  };

  return (
    <div className="App">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <Link className="logo-icon" size={32} />
            <h1>LinkSense AI</h1>
          </div>
          {isSummaryPage ? (
            <div className="summary-page-header">
              <p className="tagline">AI-Generated Content Summary</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="back-to-home-btn"
              >
                <ArrowLeft size={16} />
                Create New Summary
              </button>
            </div>
          ) : (
            <p className="tagline">
              From article to insight in one click. Powered by AI, perfected for sharing.
            </p>
          )}
        </header>

        {/* Main Content */}
        <main className="main">
          {isSummaryPage ? (
            /* Summary Page View */
            summaryData ? (
              <div className="result-section fade-in">
                <div className="result-card">
                  <div className="result-header">
                    <Sparkles className="success-icon" size={24} />
                    <h2>AI Summary</h2>
                  </div>

                  {/* Summary */}
                  <div className="summary-section">
                    <div className="summary-content">
                      {summaryData.title && <h3 className="article-title">{summaryData.title}</h3>}
                      <div className="summary-points-container" dangerouslySetInnerHTML={{
                        __html: formatSummary(summaryData.summary)
                      }} />
                    </div>
                  </div>

                  {/* Original URL Link */}
                  <div className="original-url-section">
                    <label>Original Article:</label>
                    <div className="url-info">
                      <div className="url-row">
                        <span className="url-label">Original URL:</span>
                        <div className="url-display">
                          <input
                            type="text"
                            value={summaryData.originalUrl}
                            readOnly
                            className="short-url-input"
                          />
                        </div>
                      </div>
                      <div className="url-row">
                        <span className="url-label">Direct Link:</span>
                        <div className="url-display">
                          <input
                            type="text"
                            value={summaryData.originalUrl}
                            readOnly
                            className="short-url-input"
                          />
                          <button 
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(summaryData.originalUrl);
                                // You could add a temporary "Copied!" message here
                              } catch (error) {
                                console.error('Failed to copy:', error);
                              }
                            }}
                            className="copy-btn"
                            title="Copy original URL"
                          >
                            <Copy size={18} />
                          </button>
                          <a
                            href={summaryData.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-btn"
                            title="Open original article"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Options */}
                  <div className="action-buttons">
                    <button 
                      onClick={() => {
                        setResult(summaryData);
                        setShowCopyDialog(true);
                      }}
                      className="copy-result-btn"
                    >
                      <Copy size={18} />
                      Share Summary
                    </button>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="new-url-btn"
                    >
                      Create New Summary
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-steps fade-in">
                <div className="step">
                  <div className="step-icon">
                    <Loader2 className="spin" size={16} />
                  </div>
                  <span>Loading summary...</span>
                </div>
              </div>
            )
          ) : !result ? (
            /* Input Form */
            <div className="input-section fade-in">
              <form onSubmit={handleSubmit} className="url-form">
                <div className="input-group">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter your URL here (e.g., https://example.com)"
                    className="url-input"
                    disabled={isLoading}
                    required
                  />
                  <button 
                    type="submit" 
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Shorten & Summarize
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="error-message fade-in">
                  <p>{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="loading-steps fade-in">
                  <div className="step">
                    <div className="step-icon">
                      <Loader2 className="spin" size={16} />
                    </div>
                    <span>Extracting content from webpage...</span>
                  </div>
                  <div className="step">
                    <div className="step-icon">
                      <Sparkles size={16} />
                    </div>
                    <span>Generating AI summary...</span>
                  </div>
                  <div className="step">
                    <div className="step-icon">
                      <Link size={16} />
                    </div>
                    <span>Creating short URL...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results */
            <div className="result-section fade-in">
              <div className="result-card">
                <div className="result-header">
                  <CheckCircle className="success-icon" size={24} />
                  <h2>Success!</h2>
                </div>

                {/* Short URL */}
                <div className="short-url-section">
                  <label>Your shortened URL:</label>
                  <div className="url-display">
                    <input
                      type="text"
                      value={result.shortUrl}
                      readOnly
                      className="short-url-input"
                    />
                    <button 
                      onClick={handleCopy}
                      className={`copy-btn ${copied ? 'copied' : ''}`}
                      title="Copy to clipboard"
                    >
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-btn"
                      title="Open in new tab"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                  {result.shortUrl.includes('localhost') && (
                    <div className="dev-notice">
                      📝 <strong>Development Mode:</strong> In production, this will be <code>linksenseai.com/{result.shortCode}</code>
                    </div>
                  )}
                </div>

                {/* Original URL */}
                <div className="original-url-section">
                  <label>Original URL:</label>
                  <p className="original-url">{result.originalUrl}</p>
                </div>

                {/* AI Summary */}
                <div className="summary-section">
                  <label>
                    <Sparkles size={16} />
                    AI-Generated Summary:
                  </label>
                  <div className="summary-content">
                    {result.title && <h3 className="article-title">{result.title}</h3>}
                    <div className="summary-points-container" dangerouslySetInnerHTML={{
                      __html: formatSummary(result.summary)
                    }} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    onClick={handleCopyResult} 
                    className={`copy-result-btn ${resultCopied ? 'copied' : ''}`}
                  >
                    {resultCopied ? (
                      <>
                        <CheckCircle size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy Summary
                      </>
                    )}
                  </button>
                  <button onClick={handleNewUrl} className="new-url-btn">
                    Shorten Another URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>
            Made with ❤️ using AI by <strong>Prajwal Kusha</strong> • 
            <a href="https://linkedin.com/in/prajwal-kusha" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
             • 
            <a href="mailto:p.kusha@gwu.edu?subject=Impressed by LinkSense AI - Let's discuss!&body=Hi Prajwal,%0D%0A%0D%0AI came across LinkSense AI and I'm really impressed! I'd love to discuss potential collaborations or learn more about your work.%0D%0A%0D%0ABest regards," target="_blank" rel="noopener noreferrer">
              Contact Me
            </a>
          </p>
          <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
            Impressed? Reach out to discuss more functionality and opportunities!
          </p>
        </footer>
      </div>

      {/* Copy Dialog Modal */}
      {showCopyDialog && (
        <div className="copy-dialog-overlay" onClick={() => setShowCopyDialog(false)}>
          <div className="copy-dialog" onClick={(e) => e.stopPropagation()}>
            <button 
              className="dialog-close-btn"
              onClick={() => setShowCopyDialog(false)}
            >
              <X size={20} />
            </button>
            
            <h3>Choose Copy Format</h3>
            <p>Select how you'd like to copy the summary for sharing:</p>
            
            <div className="copy-options">
              <button 
                className="copy-option-btn full"
                onClick={() => handleCopyOption('full')}
              >
                📄 Full Content
                <div style={{fontSize: '12px', opacity: 0.7, marginTop: '4px'}}>
                  Complete summary with all details
                </div>
              </button>
              
              <button 
                className="copy-option-btn condensed"
                onClick={() => handleCopyOption('condensed')}
                disabled={isGeneratingCondensed}
              >
                {isGeneratingCondensed ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    ⚡ Condensed
                    <div style={{fontSize: '12px', opacity: 0.7, marginTop: '4px'}}>
                      AI-generated concise version, perfect for quick sharing
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
