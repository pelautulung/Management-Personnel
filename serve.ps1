# PowerShell helper to serve the frontend folder on port 5500
Set-Location -Path $PSScriptRoot
Write-Host "Serving frontend from $PWD on port 5500"

if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Found python, starting http.server..."
    python -m http.server 5500
    exit
}

if (Get-Command php -ErrorAction SilentlyContinue) {
    Write-Host "Found php, starting built-in server..."
    php -S 127.0.0.1:5500 -t .
    exit
}

if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Found npx, starting http-server via npx..."
    npx http-server . -p 5500
    exit
}

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Found node, starting bundled simple_server.js..."
    node simple_server.js 5500
    exit
}

Write-Host "No suitable runtime found (python/php/node/npx)."
Write-Host "Run one of these commands manually in this folder:"
Write-Host "  python -m http.server 5500"
Write-Host "  php -S 127.0.0.1:5500 -t ."
Write-Host "  npx http-server . -p 5500"
pause
