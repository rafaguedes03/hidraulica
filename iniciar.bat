@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === HidroCalc ===
where node >nul 2>nul
if errorlevel 1 goto :semnode
if exist "frontend\node_modules" goto :backend
echo Instalando dependencias do frontend...
call npm install --prefix frontend || goto :erro
:backend
if exist "backend\node_modules\express" goto :build
echo Instalando dependencias do backend...
call npm install --prefix backend || goto :erro
:build
echo Gerando o app...
call npm run build --prefix frontend || goto :erro

echo.
echo Subindo o servidor em outra janela (http://localhost:3001)...
start "HidroCalc - servidor" cmd /k "npm start --prefix backend"
timeout /t 5 /nobreak >nul

rem Procura o cloudflared: primeiro no PATH, depois nas pastas padrao do instalador.
set "CF="
where cloudflared >nul 2>nul
if not errorlevel 1 set "CF=cloudflared"
if not defined CF if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF goto :semtunel

echo.
echo Abrindo o link publico. Procure abaixo o endereco https://....trycloudflare.com
echo e mande para quem vai testar. Para encerrar, feche esta janela e a do servidor.
echo.
"%CF%" tunnel --url http://localhost:3001
goto :fim

:semtunel
echo.
echo O app esta no ar em http://localhost:3001 (so neste computador e na sua rede).
echo Para gerar um link publico, instale o cloudflared:
echo   winget install --id Cloudflare.cloudflared
echo e rode este arquivo de novo.
goto :fim

:semnode
echo Node.js nao encontrado. Instale em https://nodejs.org e tente de novo.
goto :fim

:erro
echo.
echo Algo deu errado. Veja a mensagem acima.

:fim
echo.
pause
