chcp 65001 > $null

# Change to the directory where the script is located
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Output "未安装 Node.js。正在安装 Node.js..."
  # Download and install Node.js
  $tempInstallerPath = "$env:TEMP\node-v22.14.0-x64.msi"
  Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi" -OutFile $tempInstallerPath
  Start-Process msiexec.exe -ArgumentList "/i $tempInstallerPath /quiet /norestart" -NoNewWindow -Wait
  Remove-Item -Path $tempInstallerPath
  if ($LASTEXITCODE -ne 0) {
    Write-Output "安装 Node.js 失败。正在退出..."
    Pause
    exit 1
  }
}

# Install dependencies
Write-Output "正在安装依赖项..."
npm install > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Output "安装依赖项失败。正在退出..."
  Pause
  exit 1
}

# Install Playwright dependency
Write-Output "正在安装 Playwright 依赖项..."
npm install playwright > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Output "安装 Playwright 依赖项失败。正在退出..."
  Pause
  exit 1
}

# Install Playwright browsers
Write-Output "正在安装 Playwright 浏览器..."
$env:PLAYWRIGHT_BROWSERS_PATH = "0"
npx playwright install > $null 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Output "安装 Playwright 浏览器失败。正在退出..."
  Pause
  exit 1
}

Write-Output "==============================="
Write-Output "魔法未来国内申请填表器"
Write-Output "==============================="

function Show-Menu {
  Write-Host "请选择一个选项:"
  Write-Host "1. 以测试模式运行脚本"
  Write-Host "2. 以提交模式运行脚本"
  Write-Host "3. 退出"
  $choice = Read-Host "输入你的选择"
  return $choice
}

do {
  $choice = Show-Menu
  switch ($choice) {
    1 { $mode = "dryrun"; break }
    2 { $mode = "real"; break }
    3 { Write-Output "退出中..."; exit 0 }
    default { Write-Output "无效的选择。请重试。" }
  }
  if ($choice -in 1..3) { break }
} while ($true)

# Execute index.js using Node.js
Write-Output "请确保已在 applications.csv 中修改并添加所有申请条目。"
$confirm = Read-Host "确认继续? (y/n)"
if ($confirm -notmatch "^[yY]$") {
  Write-Output "操作已取消。"
  exit 0
}

Write-Output "正在运行 index.js..."
if ($mode -eq "dryrun") {
  node index.js --dry-run
} else {
  node index.js
}
