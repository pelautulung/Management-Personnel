@echo off
cd /d %~dp0
echo Serving frontend from %cd% on port 5500

REM Try python
where python >nul 2>&1
if %errorlevel%==0 (
  echo Found python, starting http.server...
  python -m http.server 5500
  goto :eof
)

REM Try php
where php >nul 2>&1
if %errorlevel%==0 (
  echo Found php, starting built-in server...
  php -S 127.0.0.1:5500 -t .
  goto :eof
)

REM Try npx
where npx >nul 2>&1
if %errorlevel%==0 (
  echo Found npx, starting http-server via npx...
  npx http-server . -p 5500
  goto :eof
)

REM Try node with bundled simple_server.js
where node >nul 2>&1
if %errorlevel%==0 (
  echo Found node, starting simple_server.js...
  node simple_server.js 5500
  goto :eof
)

echo No suitable runtime found (python/php/node/npx).
echo Run one of these commands manually in this folder:
echo   python -m http.server 5500
echo   php -S 127.0.0.1:5500 -t .
echo   npx http-server . -p 5500
pause
@echo off
REM Serve frontend folder on port 5500 using available runtime (python, php, npx, node)
cd /d "%~dp0"
echo Serving frontend from %CD% on port 5500

where python >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found python, starting http.server...
    python -m http.server 5500
    goto :eof
)

where php >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found php, starting built-in server...
    php -S 127.0.0.1:5500 -t .
    goto :eof
)

where npx >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found npx, starting http-server via npx...
    npx http-server . -p 5500
    goto :eof
)

where node >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Found node, starting bundled simple_server.js...
    node simple_server.js 5500
    goto :eof
)

echo No suitable runtime found (python/php/node/npx). Please install one or run one of these commands manually:
echo  - Python:  python -m http.server 5500
echo  - PHP:     php -S 127.0.0.1:5500 -t .
echo  - Node:    npx http-server . -p 5500
pause
