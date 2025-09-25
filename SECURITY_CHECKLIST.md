# 🔐 Security Checklist - BEFORE PUSHING TO GIT

## ✅ What I've Done For You:

1. **Added `config.js` to `.gitignore`** - Your API keys won't be committed
2. **Created `config.example.js`** - Safe template for others to use
3. **Created `.env.example`** - Environment variable template
4. **Installed `dotenv` package** - For environment variable support
5. **Updated README** - With security instructions

## ⚠️ What You MUST Do Before Git Push:

### Option A: Keep Current Setup (Recommended for quick testing)
```bash
# Your config.js is now ignored by git - you're safe to push!
git add .
git commit -m "Add LinkSense AI with secure config setup"
git push
```

### Option B: Switch to Environment Variables (Recommended for production)
```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env with your actual keys
nano .env

# 3. Update server.js to use config.secure.js instead of config.js
# (Replace: require('./config') with require('./config.secure'))

# 4. Push to git
git add .
git commit -m "Add LinkSense AI with environment variable config"
git push
```

## 🚨 NEVER COMMIT THESE FILES:
- ❌ `config.js` (with real API keys)
- ❌ `.env` (with real API keys)

## ✅ SAFE TO COMMIT:
- ✅ `config.example.js` (template with placeholders)
- ✅ `.env.example` (template with placeholders)
- ✅ `config.secure.js` (uses environment variables)
- ✅ All other project files

## 🔍 Double-Check Before Push:
```bash
# Make sure config.js is ignored
git status

# Should NOT see config.js in the list
# Should see "nothing to commit" for config.js
```

## 🚀 For Deployment:
When deploying to platforms like Vercel, Netlify, Railway:
1. Set environment variables in your hosting platform dashboard
2. Use the same variable names from `.env.example`
3. Never paste API keys directly in your code

---
**Your API keys are now secure! 🛡️**

## Remediation Commands (history cleanup)

1. Remove the file from history using BFG (recommended) or git filter-repo.

- Using BFG Repo-Cleaner (fast):
  1) brew install bfg  # or download jar from BFG releases
  2) git clone --mirror https://github.com/PrajwalKusha/LinkSenseAI-App.git
  3) cd LinkSenseAI-App.git
  4) java -jar bfg.jar --replace-text <(echo "sk-or-==REDACT==") --delete-files config.secure.js
  5) git reflog expire --expire=now --all && git gc --prune=now --aggressive
  6) git push --force

- Or using git filter-repo (newer tool):
  1) pip install git-filter-repo
  2) git clone https://github.com/PrajwalKusha/LinkSenseAI-App.git && cd LinkSenseAI-App
  3) git filter-repo --path config.secure.js --invert-paths
  4) git push --force

2. Rotate keys after history rewrite:
- OpenRouter: create a new key; delete old ones
- Supabase: rotate anon key if it was exposed

3. Update env vars in Render/Vercel with the new keys.
