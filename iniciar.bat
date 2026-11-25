@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === HidroCalc ===
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale em https://nodejs.org e tente de novo.
  pause
  exit /b 1
)
if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend...
  call npm install --prefix frontend || goto :erro
)
if not exist "backend\node_modules\express" (
  echo Instalando dependencias do backend...
  call npm install --prefix backend || goto :erro
)
echo Gerando o app...
call npm run build --prefix frontend || goto :erro
echo.
echo Abra http://localhost:3001 no navegador. Para parar, feche esta janela.
call npm start --prefix backend
goto :eof
:erro
echo.
echo Algo deu errado. Veja a mensagem acima.
pause
