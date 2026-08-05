# ==========================================================================
# PowerShell Runner untuk SmartGovMeeting
# ==========================================================================

$port = 8092
$nodePath = "C:\Program Files\Common Files\Adobe\Creative Cloud Libraries\libs\node.exe"

Clear-Host
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "          SMARTGOVMEETING PORTAL PERMULAAN              " -ForegroundColor Cyan
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

# 1. Semak jika port 8090 sedang digunakan dan matikan proses lama jika ada
Write-Host "[1/3] Menyemak port $port..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $procId = $conn.OwningProcess
    $procName = (Get-Process -Id $procId).Name
    Write-Host "-> Port $port dikesan digunakan oleh '$procName' (PID: $procId)." -ForegroundColor Magenta
    Write-Host "-> Menghentikan proses lama untuk mengelakkan ralat..." -ForegroundColor Magenta
    Stop-Process -Id $procId -Force
    Start-Sleep -Seconds 1
    Write-Host "-> Port dibebaskan dengan jaya." -ForegroundColor Green
} else {
    Write-Host "-> Port $port sedia digunakan." -ForegroundColor Green
}

# 2. Mulakan Node.js server di latar belakang
Write-Host "[2/3] Memulakan pelayan Node.js..." -ForegroundColor Yellow
if (Test-Path $nodePath) {
    Start-Process -FilePath $nodePath -ArgumentList "server.js" -WorkingDirectory $PSScriptRoot -NoNewWindow
    Start-Sleep -Seconds 2
    Write-Host "-> Pelayan Node.js berjaya diaktifkan di http://localhost:$port" -ForegroundColor Green
} else {
    Write-Host "-> RALAT: Node.exe tidak dijumpai di: $nodePath" -ForegroundColor Red
    Write-Host "-> Sila pastikan Node.js dipasang pada komputer anda." -ForegroundColor Red
    Exit
}

# 3. Buka sistem di pelayar web
Write-Host "[3/3] Membuka portal di pelayar web..." -ForegroundColor Yellow
Start-Process "http://localhost:$port/"
Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "Sistem sedia digunakan! Sila biarkan konsol ini terbuka." -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Green
