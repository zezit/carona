#!/bin/bash

# This script:
# 1. Runs ngrok on the backend port
# 2. Extracts the ngrok URL
# 3. Updates the mobile API route automatically

# Configuration
BACKEND_PORT=${1:-8080}
CONTEXT_PATH=${2:-/api}
FRONTEND_ENV_FILE="../mobile/.env"
FRONTEND_API_CLIENT="../mobile/api/apiClient.js"

echo "🚀 Starting ngrok tunnel for backend on port $BACKEND_PORT..."

# Run ngrok in the background
ngrok http $BACKEND_PORT > /dev/null 2>&1 &
ngrok_pid=$!

# Give ngrok a moment to start
sleep 3

# Get the ngrok public URL
ngrok_url=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*')

if [ -z "$ngrok_url" ]; then
    echo "❌ Failed to get ngrok URL. Trying alternative method..."
    # Try alternative method to get URL
    ngrok_url=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')
fi

if [ -z "$ngrok_url" ]; then
    echo "❌ Failed to get ngrok URL. Please check if ngrok is running properly."
    exit 1
fi

echo "✅ Ngrok running successfully!"
echo "🔗 Ngrok URL: $ngrok_url"

# Ensure the URL doesn't have a trailing slash
ngrok_url=${ngrok_url%/}

# Add context path if it doesn't end with it already
if [[ ! "$ngrok_url" == *"$CONTEXT_PATH" ]]; then
    api_url="${ngrok_url}${CONTEXT_PATH}"
else
    api_url="${ngrok_url}"
fi

echo "🔄 Updating mobile API route to: $api_url"

# Update .env file
if [ -f "$FRONTEND_ENV_FILE" ]; then
    # Replace the API_BASE_URL line or add it if it doesn't exist
    if grep -q "API_BASE_URL=" "$FRONTEND_ENV_FILE"; then
        sed -i "s|API_BASE_URL=.*|API_BASE_URL=$api_url|g" "$FRONTEND_ENV_FILE"
    else
        echo "API_BASE_URL=$api_url" >> "$FRONTEND_ENV_FILE"
    fi
    echo "✅ Updated $FRONTEND_ENV_FILE"
else
    echo "API_BASE_URL=$api_url" > "$FRONTEND_ENV_FILE"
    echo "✅ Created $FRONTEND_ENV_FILE"
fi

# Update apiClient.js to use the environment variable
if [ -f "$FRONTEND_API_CLIENT" ]; then
    # Replace the hardcoded URL with the environment variable
    sed -i "s|return '.*'|return API_BASE_URL;|" "$FRONTEND_API_CLIENT"
    sed -i "s|return ' .*'|return API_BASE_URL;|" "$FRONTEND_API_CLIENT"
    echo "✅ Updated $FRONTEND_API_CLIENT to use environment variable"
fi

echo "✅ API route updated successfully!"
echo "🌐 Your backend is now accessible at: $api_url"
echo "🔄 Keep this terminal open while you're using ngrok"
echo "📱 You can now start your mobile application"

# Keep script running to maintain the ngrok tunnel
echo "Press Ctrl+C to stop ngrok and exit"
wait $ngrok_pid