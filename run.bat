@echo off
chcp 65001 >nul

:: Change to the directory where the batch file is located
cd /d %~dp0

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo δ��װ Node.js�����ڰ�װ Node.js...
  :: Download and install Node.js
  powershell -Command "Start-Process msiexec.exe -ArgumentList '/i https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi /quiet /norestart' -NoNewWindow -Wait"
  if %errorlevel% neq 0 (
    echo ��װ Node.js ʧ�ܡ������˳�...
    pause
    exit /b 1
  )
)

:: install dependencies
echo ���ڰ�װ������...
call npm install >nul 2>&1
if %errorlevel% neq 0 (
  echo ��װ������ʧ�ܡ������˳�...
  pause
  exit /b 1
)

:: install playwright dependency
echo ���ڰ�װ Playwright ������...
call npm install playwright >nul 2>&1
if %errorlevel% neq 0 (
  echo ��װ Playwright ������ʧ�ܡ������˳�...
  pause
  exit /b 1
)

:: install playwright browsers
echo ���ڰ�װ Playwright �����...
set PLAYWRIGHT_BROWSERS_PATH=0
call npx playwright install >nul 2>&1
if %errorlevel% neq 0 (
  echo ��װ Playwright �����ʧ�ܡ������˳�...
  pause
  exit /b 1
)

echo ================================
echo ħ��δ���������������
echo ================================

:menu
echo ��ѡ��һ��ѡ��:
echo 1. �Բ���ģʽ���нű�
echo 2. ���ύģʽ���нű�
echo 3. �˳�
set /p choice="�������ѡ��: "

if "%choice%"=="1" (
  set mode=dryrun
) else if "%choice%"=="2" (
  set mode=real
) else if "%choice%"=="3" (
  echo �˳���...
  exit /b 0
) else (
  echo ��Ч��ѡ�������ԡ�
  goto menu
)

:: Execute index.js using Node.js
echo ��ȷ������ applications.csv ���޸Ĳ��������������Ŀ��
set /p confirm="ȷ�ϼ���? (y/n): "
if /i not "%confirm%"=="y" (
  echo ������ȡ����
  exit /b 0
)
echo �������� index.js...
if "%mode%"=="dryrun" (
  node index.js --dry-run
) else (
  node index.js
)