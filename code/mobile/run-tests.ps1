Write-Host 'Starting E2E tests...' -ForegroundColor Cyan

$env:EXPO_DEVTOOLS = 'false'

$devices = adb devices | Select-String 'emulator'
if (-not $devices) {
    Write-Host 'No emulator found' -ForegroundColor Red
    exit 1
}

Write-Host 'Emulator found' -ForegroundColor Green
Write-Host 'Please start Expo manually:' -ForegroundColor Yellow
Write-Host '   Run: expo start' -ForegroundColor Cyan

Read-Host 'Press Enter when Expo is ready'

Write-Host 'Running tests...' -ForegroundColor Green
maestro test test/.maestro/

if ($LASTEXITCODE -eq 0) {
    Write-Host 'Tests passed!' -ForegroundColor Green
} else {
    Write-Host 'Tests failed!' -ForegroundColor Red
}
