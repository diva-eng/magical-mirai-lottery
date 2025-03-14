@echo off
chcp 65001 >nul

:: Change to the directory where the batch file is located
cd /d %~dp0

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo 未安装 Node.js。正在安装 Node.js...
  :: Download and install Node.js
  powershell -Command "Start-Process msiexec.exe -ArgumentList '/i https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi /quiet /norestart' -NoNewWindow -Wait"
  if %errorlevel% neq 0 (
    echo 安装 Node.js 失败。正在退出...
    pause
    exit /b 1
  )
)

:: install dependencies
echo 正在安装依赖项...
call npm install >nul 2>&1
if %errorlevel% neq 0 (
  echo 安装依赖项失败。正在退出...
  pause
  exit /b 1
)

:: install playwright dependency
echo 正在安装 Playwright 依赖项...
call npm install playwright >nul 2>&1
if %errorlevel% neq 0 (
  echo 安装 Playwright 依赖项失败。正在退出...
  pause
  exit /b 1
)

:: install playwright browsers
echo 正在安装 Playwright 浏览器...
set PLAYWRIGHT_BROWSERS_PATH=0
call npx playwright install >nul 2>&1
if %errorlevel% neq 0 (
  echo 安装 Playwright 浏览器失败。正在退出...
  pause
  exit /b 1
)

echo ================================
echo 魔法未来国内申请填表器
echo ================================

:menu
echo 请选择一个选项:
echo 1. 以测试模式运行脚本
echo 2. 以提交模式运行脚本
echo 3. 退出
set /p choice="输入你的选择: "

if "%choice%"=="1" (
  set mode=dryrun
) else if "%choice%"=="2" (
  set mode=real
) else if "%choice%"=="3" (
  echo 退出中...
  exit /b 0
) else (
  echo 无效的选择。请重试。
  goto menu
)

:: Execute index.js using Node.js
echo 请确保已在 applications.csv 中修改并添加所有申请条目。
set /p confirm="确认继续? (y/n): "
if /i not "%confirm%"=="y" (
  echo 操作已取消。
  exit /b 0
)
echo 正在运行 index.js...
if "%mode%"=="dryrun" (
  node index.js --dry-run
) else (
  node index.js
)