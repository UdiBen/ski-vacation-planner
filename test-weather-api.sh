#!/bin/bash

# Test OpenWeather API Key Script

echo "🌤️  Testing OpenWeather API Key"
echo "================================"
echo ""

# Load API key from .env
if [ -f "backend/.env" ]; then
    export $(cat backend/.env | grep OPENWEATHER_API_KEY | xargs)
else
    echo "❌ backend/.env file not found"
    exit 1
fi

if [ -z "$OPENWEATHER_API_KEY" ]; then
    echo "❌ OPENWEATHER_API_KEY not set in .env file"
    exit 1
fi

echo "Testing API key: ${OPENWEATHER_API_KEY:0:8}..."
echo ""

# Test the API
response=$(curl -s "https://api.openweathermap.org/data/2.5/weather?q=London&appid=$OPENWEATHER_API_KEY&units=metric")

# Check if successful
if echo "$response" | grep -q '"cod":200'; then
    echo "✅ API Key is VALID!"
    echo ""
    echo "Sample response:"
    echo "$response" | grep -o '"name":"[^"]*"' | head -1
    echo "$response" | grep -o '"temp":[^,]*' | head -1
    echo "$response" | grep -o '"weather":\[{"id":[^}]*' | head -1
    echo ""
    echo "✅ Weather functionality will work!"
elif echo "$response" | grep -q '"cod":401'; then
    echo "❌ API Key is INVALID"
    echo ""
    echo "Error message:"
    echo "$response" | grep -o '"message":"[^"]*"'
    echo ""
    echo "📝 To fix this:"
    echo "1. Go to https://openweathermap.org/api"
    echo "2. Sign up for a free account"
    echo "3. Get your API key from the dashboard"
    echo "4. Wait 10-15 minutes for activation"
    echo "5. Update OPENWEATHER_API_KEY in backend/.env"
    echo "6. Run this script again to verify"
else
    echo "⚠️  Unexpected response:"
    echo "$response"
fi
