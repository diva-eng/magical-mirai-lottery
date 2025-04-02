chcp 65001 > $null

# Change to the directory where the script is located
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Output "未安装 Node.js。正在安装 Node.js..."
  # Download and install Node.js
  $tempInstallerPath = "$env:TEMP\node-v22.14.0-x64.msi"
  Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi" -OutFile $tempInstallerPath
  Start-Process msiexec.exe -ArgumentList "/passive /package $tempInstallerPath" -NoNewWindow -Wait
  Remove-Item -Path $tempInstallerPath
  if ($LASTEXITCODE -ne 0) {
    Write-Output "安装 Node.js 失败。正在退出..."
    Pause
    exit 1
  }
}

# Reload the environment variables to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")

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

# List of lottery urls and their corresponding names and dates
$lotteryUrls = @(
  @{ Name = "オフィシャルWEB抽選先行（一次受付）"; Url = "http://pia.jp/v/magicalmirai25-1/"; Date = "2025年3月14日(金) 12:00 ～ 3月31日(月) 23:59"; Type = "domestic" },
  @{ Name = "オフィシャルWEB抽選先行（二次受付）"; Url = "http://pia.jp/v/magicalmirai25-2/"; Date = "2025年4月18日(金) 12:00 ～ 5月12日(月) 23:59" ; Type = "domestic"},
  @{ Name = "Advance lottery reservation from website"; Url = "http://pia.jp/v/magicalmirai25-1en/"; Date = "April 18th (Fri.) 2025, 12:00 JST - May 12th (Mon.) 2025, 23:59 JST" ; Type = "overseas"},
  @{ Name = "Advance lottery reservation from website"; Url = "http://pia.jp/v/magicalmirai25-2en/"; Date = "May 16th (Fri.) 2025, 12:00 JST - June 2nd (Mon.) 2025, 23:59 JST"; Type = "overseas" }
)

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

function Select-Lottery {
  Write-Host "请选择一个抽选项目:"
  for ($i = 0; $i -lt $lotteryUrls.Count; $i++) {
    $typeDisplay = if ($lotteryUrls[$i].Type -eq "domestic") { "国内" } else { "海外" }
    Write-Host "$($i + 1). [$typeDisplay] $($lotteryUrls[$i].Name) - $($lotteryUrls[$i].Date)"
  }
  $selection = Read-Host "输入你的选择 (1-$($lotteryUrls.Count))"
  if ($selection -match "^\d+$" -and $selection -ge 1 -and $selection -le $lotteryUrls.Count) {
    return $lotteryUrls[$selection - 1]
  } else {
    Write-Host "无效的选择，请重试。"
    return $null
  }
}

do {
  $selectedLottery = Select-Lottery
} while (-not $selectedLottery)

Write-Host "已选择: $($selectedLottery.Name)"

# Ask if the user wants to use a random proxy
Write-Host "是否使用随机代理? (y/n)"
$useProxy = Read-Host "输入你的选择"
if ($useProxy -match "^[yY]$") {
  Write-Output "已选择使用随机代理。"
  $proxyEnabled = $true
} else {
  Write-Output "未选择使用随机代理。"
  $proxyEnabled = $false
}

# Execute index.js using Node.js
Write-Output "请确保已在 applications.json 中修改并添加所有申请条目。"
$confirm = Read-Host "确认继续? (y/n)"
if ($confirm -notmatch "^[yY]$") {
  Write-Output "操作已取消。"
  exit 0
}
Write-Output "正在运行 index.js..."
if ($mode -eq "dryrun") {
  if ($proxyEnabled) {
    node index.js --dry-run --type "$($selectedLottery.Type)" --url "$($selectedLottery.Url)" --use-proxy
  } else {
    node index.js --dry-run --type "$($selectedLottery.Type)" --url "$($selectedLottery.Url)"
  }
} else {
  if ($proxyEnabled) {
    node index.js --type "$($selectedLottery.Type)" --url "$($selectedLottery.Url)" --use-proxy
  } else {
    node index.js --type "$($selectedLottery.Type)" --url "$($selectedLottery.Url)"
  }
}
