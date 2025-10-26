# Deployment Guide - Vercel + Render (FREE)

This guide shows you how to deploy the Ski Vacation Planner for **FREE** using:
- **Vercel** for the frontend (React app)
- **Render** for the backend (Node.js API)

Note: Render free tier spins down after 15 minutes of inactivity (first request may be slow)

---

## Prerequisites

- [x] GitHub account
- [x] Code pushed to GitHub repository
- [x] OpenAI API key

---

## Step 1: Deploy Frontend to Vercel (5 minutes)

### Option A: Vercel Dashboard (Easiest)

1. **Go to https://vercel.com**
   - Sign up/login with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `ski-vacation-planner` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend will be live at: `https://your-project.vercel.app`

### Option B: Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: ski-vacation-planner
# - Directory: ./
# - Override settings? No
```

---

## Step 2: Deploy Backend to Render (5 minutes)

1. **Go to https://dashboard.render.com**
   - Sign up/login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Click "Build and deploy from a Git repository"
   - Click "Next"

3. **Connect Repository**
   - Find your `ski-vacation-planner` repository
   - Click "Connect"

4. **Configure Service**
   - **Name:** `ski-planner-backend` (or any name you like)
   - **Region:** Oregon (US West) or closest to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. **Add Environment Variable**
   - Scroll down to "Environment Variables"
   - Click "Add Environment Variable"
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-...`)

6. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your backend will be live at: `https://ski-planner-backend.onrender.com`

---

## Step 3: Connect Frontend to Backend (2 minutes)

1. **Copy Your Backend URL**
   - From Render dashboard, copy your service URL
   - Example: `https://ski-planner-backend.onrender.com`

2. **Add Environment Variable in Vercel**
   - Go to your project on Vercel dashboard
   - Click "Settings" → "Environment Variables"
   - Add new variable:
     - Name: `VITE_API_URL`
     - Value: Your Render backend URL (without `/api`)
     - Example: `https://ski-planner-backend.onrender.com`
   - Click "Save"

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

---

## Step 4: Test Your Deployment

1. **Open Your App**
   - Visit your Vercel URL: `https://your-project.vercel.app`

2. **Test Features**
   - [ ] Chat interface loads
   - [ ] Send a message: "Hello!"
   - [ ] Test weather: "What's the weather in Aspen?"
   - [ ] Test currency: "Convert 100 USD to EUR"

3. **Check for Errors**
   - Open browser console (F12)
   - Look for any red errors
   - Check Network tab for failed requests

---

## Troubleshooting

### Frontend shows "Failed to connect to backend"

**Solution:**
1. Check `VITE_API_URL` is set correctly in Vercel
2. Make sure it doesn't end with `/api` (that's added automatically)
3. Verify backend is running on Render

### Backend returns 500 errors

**Solution:**
1. Check Render logs (click "Logs" tab in dashboard)
2. Verify `OPENAI_API_KEY` is set correctly
3. Make sure key is valid and has credits

### CORS errors in browser console

**Solution:**
- Backend already has CORS enabled for all origins
- If you see CORS errors, check the backend URL is correct

### Backend is slow on first request

**Explanation:**
- Render free tier spins down after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up (cold start)
- Subsequent requests are fast
- This is normal for Render's free tier

---

## Deployment Checklist

After successful deployment:

- [ ] Frontend URL works: `https://your-project.vercel.app`
- [ ] Backend URL works: `https://ski-planner-backend.onrender.com/health`
- [ ] Environment variables set in both services
- [ ] Test chat functionality
- [ ] Send a message: "Hello!"
- [ ] Test weather: "What's the weather in Aspen?"
- [ ] Test currency: "Convert 100 USD to EUR"
- [ ] No errors in browser console
- [ ] Backend logs show no errors in Render dashboard

---

## Updating Your App

### Auto-Deploy on Git Push

Both Vercel and Render automatically redeploy when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- Vercel will rebuild frontend (~2 min)
- Render will rebuild backend (~3-5 min)

### Manual Deploy

**Vercel:**
- Dashboard → Deployments → Click "..." → Redeploy

**Render:**
- Dashboard → Your service → "Manual Deploy" → "Deploy latest commit"

---

## Cost Breakdown

| Service | Free Tier Limits | Cost |
|---------|------------------|------|
| **Vercel** | 100 GB bandwidth/month, Unlimited sites | $0 |
| **Render** | 750 hours/month, Spins down after 15min idle | $0 |
| **OpenAI API** | Pay-as-you-go | ~$0.10-0.50/day |

**Total Infrastructure: $0/month** 🎉

*Note: Render free tier has cold starts (30-60s first request after idle)*

---

## URLs Reference

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://ski-planner.vercel.app` | User interface |
| Backend | `https://ski-planner-backend.onrender.com` | API server |
| Backend Health | `https://ski-planner-backend.onrender.com/health` | Health check |

---

## Advanced Configuration

### Custom Domain (Optional)

**Vercel:**
1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**Render:**
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS CNAME record

### Environment Variables

**Backend (Render):**
```
OPENAI_API_KEY=sk-...    # Required
PORT=10000               # Auto-set by Render
NODE_ENV=production      # Optional
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## Monitoring & Logs

### Vercel Logs
- Dashboard → Your Project → Deployments → Click deployment → "View Function Logs"

### Render Logs
- Dashboard → Your service → Logs tab
- Real-time streaming logs
- Can download logs for debugging

---

## Alternative FREE Options

If Vercel + Render doesn't work for you:

1. **Netlify + Railway** - Both have free tiers
2. **GitHub Pages + Glitch** - 100% free
3. **Cloudflare Pages + Railway** - Both have free tiers

Note: Cyclic is no longer recommended (service unstable)

---

## Getting Help

**Common Issues:**
- Check logs in Vercel and Render dashboards
- Verify environment variables are set
- Test backend directly: `curl https://your-backend.onrender.com/health`

**Resources:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- OpenAI Status: https://status.openai.com

---

## Success! 🎉

Your Ski Vacation Planner is now live and accessible worldwide for FREE!

Share your deployment URL and impress your friends! ⛷️
