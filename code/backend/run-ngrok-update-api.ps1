# This script:
# 1. Runs ngrok on the backend port
# 2. Extracts the ngrok URL
# 3. Updates the mobile API route automatically

param(
    [int]$BackendPort = 8080,
    [string]$ContextPath = "/api"
)

# Configuration
$MOBILE_API_CLIENT = "../mobile/src/services/api/apiClient.js"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "Starting ngrok tunnel for backend on port $BackendPort..." "Cyan"

# Run ngrok in the background
try {
    $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", $BackendPort -WindowStyle Hidden -PassThru
    $ngrok_pid = $ngrokProcess.Id
}
catch {
    Write-ColorOutput "Failed to start ngrok. Please ensure ngrok is installed and in your PATH." "Red"
    exit 1
}

# Give ngrok a moment to start
Write-Host "Waiting for ngrok to initialize..."
Start-Sleep 3

# Function to get ngrok URL
function Get-NgrokUrl {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction Stop
        $httpsUrl = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url
        return $httpsUrl
    }
    catch {
        return $null
    }
}

# Get the ngrok public URL
$ngrok_url = Get-NgrokUrl

if ([string]::IsNullOrEmpty($ngrok_url)) {
    Write-ColorOutput "Failed to get ngrok URL. Trying alternative method..." "Yellow"
    Start-Sleep 2
    $ngrok_url = Get-NgrokUrl
}

if ([string]::IsNullOrEmpty($ngrok_url)) {
    Write-ColorOutput "Failed to get ngrok URL. Please check if ngrok is running properly." "Red"
    try {
        Stop-Process -Id $ngrok_pid -Force -ErrorAction SilentlyContinue
    }
    catch {}
    exit 1
}

Write-ColorOutput "Ngrok running successfully!" "Green"
Write-ColorOutput "Ngrok URL: $ngrok_url" "Cyan"

# Ensure the URL doesn't have a trailing slash
$ngrok_url = $ngrok_url.TrimEnd('/')

# Add context path if it doesn't end with it already
if (-not $ngrok_url.EndsWith($ContextPath)) {
    $api_url = "${ngrok_url}${ContextPath}"
}
else {
    $api_url = $ngrok_url
}

Write-ColorOutput "Updating mobile API route to: $api_url" "Yellow"

# Update apiClient.js to use the environment variable
if (Test-Path $MOBILE_API_CLIENT) {
    try {
        # Read the file content
        $fileContent = Get-Content $MOBILE_API_CLIENT -Raw
        
        # Find the current URL (line after "NGROK ROUTE HERE")
        $lines = Get-Content $MOBILE_API_CLIENT
        $commentLineIndex = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "NGROK ROUTE HERE") {
                $commentLineIndex = $i
                break
            }
        }
        
        if ($commentLineIndex -ge 0 -and ($commentLineIndex + 1) -lt $lines.Count) {
            $currentUrlLine = $lines[$commentLineIndex + 1]
            Write-Host "Previous API URL: $currentUrlLine"
            
            # Replace the line after the comment with the new ngrok URL
            $lines[$commentLineIndex + 1] = "  return `"$api_url`";"
            
            # Write the updated content back to the file
            $lines | Set-Content $MOBILE_API_CLIENT -Encoding UTF8
            
            Write-ColorOutput "Updated $MOBILE_API_CLIENT with new URL: $api_url" "Green"
        }
        else {
            Write-ColorOutput "Could not find 'NGROK ROUTE HERE' comment in $MOBILE_API_CLIENT" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "Failed to update $MOBILE_API_CLIENT. Error: $($_.Exception.Message)" "Red"
    }
}
else {
    Write-ColorOutput "File $MOBILE_API_CLIENT not found. Skipping file update." "Yellow"
}

Write-ColorOutput "API route updated successfully!" "Green"
Write-ColorOutput "Your backend is now accessible at: $api_url" "Cyan"
Write-ColorOutput "Keep this terminal open while you're using ngrok" "Yellow"
Write-ColorOutput "You can now start your mobile application" "Green"

# Function to handle cleanup on exit
function Stop-NgrokProcess {
    try {
        if ($ngrokProcess -and -not $ngrokProcess.HasExited) {
            Write-ColorOutput "Stopping ngrok..." "Yellow"
            Stop-Process -Id $ngrok_pid -Force -ErrorAction SilentlyContinue
            Write-ColorOutput "Ngrok stopped successfully!" "Green"
        }
    }
    catch {
        Write-ColorOutput "Could not stop ngrok process cleanly" "Yellow"
    }
}

# Register cleanup function for Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Stop-NgrokProcess
}

# Keep script running to maintain the ngrok tunnel
Write-ColorOutput "Press Ctrl+C to stop ngrok and exit" "Cyan"

try {
    # Wait for the ngrok process to exit or user interruption
    while (-not $ngrokProcess.HasExited) {
        Start-Sleep 1
    }
}
catch {
    # Handle interruption (Ctrl+C)
    Stop-NgrokProcess
}
finally {
    Stop-NgrokProcess
}