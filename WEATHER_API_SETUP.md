# OpenWeather API Setup Guide

## Problem: Weather Queries Not Working

If you're getting errors when asking about weather, it's likely because the OpenWeather API key is invalid or not activated.

## Solution: Get a Valid API Key

### Step 1: Sign Up for OpenWeather

1. Go to **https://openweathermap.org/api**
2. Click **"Sign Up"** (top right)
3. Create a free account
4. Verify your email

### Step 2: Get Your API Key

1. Log in to your OpenWeather account
2. Go to **https://home.openweathermap.org/api_keys**
3. You'll see a default API key, or create a new one
4. **Copy the API key** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 3: Important - Wait for Activation

⏰ **API keys take 10-15 minutes to activate after creation**

This is the most common issue! If you just created the key, wait 15 minutes.

### Step 4: Update Your .env File

1. Open `backend/.env` in your text editor
2. Find the line: `OPENWEATHER_API_KEY=...`
3. Replace with your new key:
   ```
   OPENWEATHER_API_KEY=your_actual_key_here
   ```
4. Save the file

### Step 5: Verify Your Key Works

Run the test script:

```bash
./test-weather-api.sh
```

You should see:
```
✅ API Key is VALID!
✅ Weather functionality will work!
```

### Step 6: Restart Your Application

If the app is running, restart it:

```bash
# Stop it (Ctrl+C)
# Then start again
npm run dev
```

## Testing Weather Queries

Once your key is valid, try these queries:

```
"What's the weather in Aspen?"
"Show me the snow forecast for Chamonix"
"How are the conditions in Whistler?"
```

You should see:
- Real-time temperature and conditions
- A blue "Live Weather" badge on the message
- 5-day forecast

## Troubleshooting

### Issue: "Invalid API key" error

**Cause:** Key not activated yet or incorrect key

**Solution:**
1. Wait 15 minutes after creating the key
2. Run `./test-weather-api.sh` to verify
3. Make sure you copied the entire key (no spaces)

### Issue: Weather queries still fail after key is valid

**Cause:** App cached the old configuration

**Solution:**
1. Stop the app (Ctrl+C)
2. Restart: `npm run dev`
3. The backend will reload the .env file

### Issue: "Weather API not configured" warning

**Cause:** .env file not found or OPENWEATHER_API_KEY is empty

**Solution:**
1. Verify `backend/.env` exists (not just `.env.example`)
2. Check the key is on a line without comments:
   ```
   # Good:
   OPENWEATHER_API_KEY=a1b2c3d4e5...

   # Bad (commented out):
   # OPENWEATHER_API_KEY=a1b2c3d4e5...
   ```

## Running Without Weather API

The app will still work without weather functionality:

✅ **What works:**
- General ski resort recommendations
- Currency conversions
- Planning advice
- Context-aware conversations

❌ **What doesn't work:**
- Real-time weather queries
- Snow condition checks
- Current temperature data

The assistant will politely tell users it can't access weather data and provide general recommendations instead.

## Free Tier Limits

OpenWeather free tier includes:
- ✅ 60 calls per minute
- ✅ 1,000,000 calls per month
- ✅ Current weather data
- ✅ 5-day forecast

This is more than enough for development and testing!

## Alternative: Use Mock Weather Data

If you can't get an API key, you could modify the code to return mock data for testing. Let me know if you need help with this!

---

**Need Help?**
- OpenWeather FAQ: https://openweathermap.org/faq
- OpenWeather Support: https://home.openweathermap.org/questions

**Quick Test:**
```bash
./test-weather-api.sh
```
