#!/bin/bash

# This script:
# 1. Runs ngrok on the backend port
# 2. Extracts the ngrok URL
# 3. Updates the mobile API route automatically

# Configuration
BACKEND_PORT=${1:-8080}
CONTEXT_PATH=${2:-/api}
MOBILE_API_CLIENT="../mobile/src/services/api/apiClient.js"

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

# Update apiClient.js to use the environment variable
if [ -f "$MOBILE_API_CLIENT" ]; then
    # Get the current URL from the file
    current_url=$(grep -A1 "NGROK ROUTE HERE" "$MOBILE_API_CLIENT" | tail -n1)
    echo "Previous API URL: $current_url"
    
    # Replace the line after the comment with the new ngrok URL
    sed -i "/NGROK ROUTE HERE/!b;n;c\  return \"$api_url\";" "$MOBILE_API_CLIENT"
    echo "✅ Updated $MOBILE_API_CLIENT with new URL: \"$api_url\""
fi

echo "✅ API route updated successfully!"
echo " 🌐 Your backend is now accessible at: $api_url"
echo "🔄 Keep this terminal open while you're using ngrok"
echo "📱 You can now start your mobile application"

# Keep script running to maintain the ngrok tunnel
echo "Press Ctrl+C to stop ngrok and exit"
wait $ngrok_pid