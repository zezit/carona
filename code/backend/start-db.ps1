# Define colors for PowerShell
$Green = "Green"
$Blue = "Cyan"
$Red = "Red"
$Yellow = "Yellow"

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Check if docker-compose file exists
$composeFileExists = (Test-Path "docker-compose.yml") -or (Test-Path "compose.yml")

if (-not $composeFileExists) {
    Write-ColorOutput "Error: No docker-compose.yml or compose.yml file found in current directory" $Red
    Write-ColorOutput "Current directory: $(Get-Location)" $Blue
    Write-ColorOutput "Looking for compose files in parent directories..." $Blue
    
    # Check parent directory
    $parentComposeExists = (Test-Path "../docker-compose.yml") -or (Test-Path "../compose.yml")
    
    if ($parentComposeExists) {
        Write-ColorOutput "Found compose file in parent directory" $Green
        Set-Location ".."
    }
    else {
        Write-ColorOutput "No compose file found. Please ensure docker-compose.yml exists." $Red
        exit 1
    }
}

# Start all services by default
Write-ColorOutput "Starting MySQL and RabbitMQ containers..." $Blue
docker compose up -d

# Get environment variables with defaults
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "carpool_password" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "carpool_db" }
$RABBITMQ_PORT = if ($env:RABBITMQ_PORT) { $env:RABBITMQ_PORT } else { "5672" }
$RABBITMQ_MANAGEMENT_PORT = if ($env:RABBITMQ_MANAGEMENT_PORT) { $env:RABBITMQ_MANAGEMENT_PORT } else { "15672" }
$RABBITMQ_USER = if ($env:RABBITMQ_USER) { $env:RABBITMQ_USER } else { "guest" }
$RABBITMQ_PASSWORD = if ($env:RABBITMQ_PASSWORD) { $env:RABBITMQ_PASSWORD } else { "guest" }

Write-ColorOutput "Waiting for MySQL to be ready..." $Blue

# Wait for MySQL to be ready
$mysqlReady = $false
while (-not $mysqlReady) {
    try {
        $result = docker exec "carpool-mysql" mysqladmin --user=root --password="$DB_PASSWORD" ping --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            $mysqlReady = $true
        }
        else {
            Write-Host "." -NoNewline
            Start-Sleep 1
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep 1
    }
}

Write-Host ""
Write-ColorOutput "MySQL is ready!" $Green
Write-ColorOutput "Database is running at localhost:$DB_PORT" $Blue
Write-Host "  - Database name: $DB_NAME"
Write-Host "  - Username: root"
Write-Host "  - Password: $DB_PASSWORD"

Write-Host ""
Write-ColorOutput "Checking RabbitMQ status..." $Blue

# Wait for RabbitMQ to be ready
$rabbitmqReady = $false
while (-not $rabbitmqReady) {
    try {
        $result = docker exec "carpool-rabbitmq" rabbitmq-diagnostics -q ping 2>$null
        if ($LASTEXITCODE -eq 0) {
            $rabbitmqReady = $true
        }
        else {
            Write-Host "." -NoNewline
            Start-Sleep 1
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep 1
    }
}

Write-Host ""
Write-ColorOutput "RabbitMQ is ready!" $Green
Write-ColorOutput "RabbitMQ is running at localhost:$RABBITMQ_PORT" $Blue
Write-ColorOutput "RabbitMQ Management UI is available at http://localhost:$RABBITMQ_MANAGEMENT_PORT" $Blue
Write-Host "  - Username: $RABBITMQ_USER"
Write-Host "  - Password: $RABBITMQ_PASSWORD"
Write-Host ""
Write-ColorOutput "To stop all services, run: " $Blue -NoNewline
Write-Host "docker compose down"
Write-ColorOutput "To stop a specific service, run: " $Blue -NoNewline
Write-Host "docker compose stop [mysql|rabbitmq]"