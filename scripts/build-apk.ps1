$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json

$jdkCandidates = @()
$jdkCandidates += Get-ChildItem 'C:\Program Files\Microsoft' -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like 'jdk-21*' } |
  Sort-Object Name -Descending |
  ForEach-Object { $_.FullName }
if ($env:JAVA_HOME) { $jdkCandidates += $env:JAVA_HOME }
$jdk = $jdkCandidates | Where-Object { Test-Path (Join-Path $_ 'bin\java.exe') } | Select-Object -First 1
if (-not $jdk) { throw '未找到 JDK 21。请安装 Microsoft OpenJDK 21 后重试。' }

$sdkCandidates = @($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME, (Join-Path $env:LOCALAPPDATA 'Android\Sdk'))
$sdk = $sdkCandidates | Where-Object { $_ -and (Test-Path (Join-Path $_ 'platforms\android-36')) } | Select-Object -First 1
if (-not $sdk) { throw '未找到 Android SDK 36。请安装 platforms;android-36 和 build-tools;36.0.0。' }

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:Path = "$jdk\bin;$sdk\platform-tools;$env:Path"

Push-Location $projectRoot
try {
  & npm.cmd run android:sync
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Push-Location (Join-Path $projectRoot 'android')
  try {
    & .\gradlew.bat assembleLocal --no-daemon
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally {
    Pop-Location
  }

  $source = Join-Path $projectRoot 'android\app\build\outputs\apk\local\app-local.apk'
  if (-not (Test-Path -LiteralPath $source)) { throw "未找到构建产物：$source" }
  $outputDir = Join-Path $projectRoot 'release-apk'
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  $target = Join-Path $outputDir ("ranji-{0}-local.apk" -f $package.version)
  Copy-Item -LiteralPath $source -Destination $target -Force
  $file = Get-Item -LiteralPath $target
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [IO.File]::ReadAllBytes($target)
    $hash = (($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '')
  } finally {
    $sha.Dispose()
  }
  Write-Host "APK: $target"
  Write-Host ("大小: {0:N2} MB" -f ($file.Length / 1MB))
  Write-Host "SHA256: $hash"
} finally {
  Pop-Location
}