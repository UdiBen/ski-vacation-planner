# Deployment Guide

## Quick Deploy to Render

### Prerequisites
- [ ] GitHub repository created and code pushed
- [ ] Render account created at https://render.com
- [ ] OpenAI API key ready

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Select your GitHub repository
   - Render will detect `render.yaml` automatically

3. **Configure Environment Variables**
   When prompted, enter:
   - `OPENAI_API_KEY`: Your OpenAI API key

4. **Wait for Deployment**
   - Backend will deploy first (~3-5 minutes)
   - Frontend will deploy second (~2-3 minutes)
   - Total time: ~5-8 minutes

5. **Access Your App**
   - Frontend: `https://ski-planner-frontend.onrender.com`
   - Backend: `https://ski-planner-backend.onrender.com`

### Verification Checklist

After deployment, verify:
- [ ] Frontend loads without errors
- [ ] Can send a message in the chat
- [ ] Weather API calls work (ask "What's the weather in Aspen?")
- [ ] Currency API calls work (ask "Convert 100 USD to EUR")
- [ ] Console shows no errors

### Troubleshooting

**Frontend can't connect to backend:**
- Check that `VITE_API_URL` is set correctly in Render dashboard
- Should be: `https://ski-planner-backend.onrender.com`

**Backend errors:**
- Check `OPENAI_API_KEY` is set in environment variables
- View logs in Render dashboard → Backend service → Logs

**500 errors:**
- Check backend logs for specific error messages
- Verify OpenAI API key is valid and has credits

### Cost Estimate

**Render Free Tier:**
- Backend: Free (750 hours/month - enough for 24/7)
- Frontend: Free (static site hosting)
- Total: **$0/month**

**OpenAI API:**
- GPT-5: ~$0.015 per 1K tokens
- GPT-5-mini: ~$0.003 per 1K tokens
- Estimate: $0.10-0.50 per day depending on usage

### Updates & Maintenance

**Automatic Deploys:**
- Render automatically deploys when you push to main branch
- No manual steps required after initial setup

**Manual Deploy:**
- Go to Render dashboard
- Select service (backend or frontend)
- Click "Manual Deploy" → "Deploy latest commit"

### Environment Variables Reference

**Backend:**
```
OPENAI_API_KEY=sk-...    # Required
PORT=3005                # Auto-set by Render
NODE_ENV=production      # Auto-set by Render
```

**Frontend:**
```
VITE_API_URL=https://ski-planner-backend.onrender.com
```
(Automatically configured by render.yaml)

### Alternative Deployment Options

#### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend on Render:**
- Create new Web Service
- Build: `cd backend && npm install && npm run build`
- Start: `cd backend && npm start`

#### Option 2: Railway

Similar to Render but with different free tier:
```yaml
# railway.toml would be needed
```

#### Option 3: Self-hosting

Requirements:
- Node.js 18+
- Port 3005 for backend
- Port 3000 for frontend (or use nginx)

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend (serve with nginx or use serve package)
cd frontend
npm install
npm run build
npx serve -s dist -l 3000
```

## Production Optimization Tips

1. **Enable caching** for faster loads
2. **Add monitoring** (Render has built-in monitoring)
3. **Set up error tracking** (optional: Sentry)
4. **Configure custom domain** (optional, requires DNS setup)
5. **Add rate limiting** to prevent API abuse

## Security Notes

- Never commit `.env` files
- OpenAI API key should only be in Render dashboard
- Use environment variables for all secrets
- Enable HTTPS (automatic on Render)
- Consider adding API authentication for production use

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test locally first with `npm run dev`
4. Check OpenAI API status: https://status.openai.com
