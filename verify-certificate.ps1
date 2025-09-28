# PowerShell script to verify certificate installation
Write-Host "Checking certificate installation..." -ForegroundColor Green

# Check if the Test CA certificate is installed in Current User store
$userCerts = Get-ChildItem Cert:\CurrentUser\Root | Where-Object { $_.Subject -like "*Test CA*" }

if ($userCerts) {
    Write-Host "✓ CA Certificate found in Current User store" -ForegroundColor Green
    Write-Host "  Subject: $($userCerts.Subject)" -ForegroundColor Yellow
    Write-Host "  Thumbprint: $($userCerts.Thumbprint)" -ForegroundColor Yellow
    Write-Host "  Valid Until: $($userCerts.NotAfter)" -ForegroundColor Yellow
} else {
    Write-Host "✗ CA Certificate NOT found in Current User store" -ForegroundColor Red
}

# Check if the Test CA certificate is installed in Local Machine store
try {
    $machineCerts = Get-ChildItem Cert:\LocalMachine\Root -ErrorAction Stop | Where-Object { $_.Subject -like "*Test CA*" }
    
    if ($machineCerts) {
        Write-Host "✓ CA Certificate found in Local Machine store" -ForegroundColor Green
        Write-Host "  Subject: $($machineCerts.Subject)" -ForegroundColor Yellow
    } else {
        Write-Host "! CA Certificate NOT found in Local Machine store (requires admin privileges)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "! Could not check Local Machine store (requires admin privileges)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your browser completely" -ForegroundColor White
Write-Host "2. Navigate to https://localhost:3000" -ForegroundColor White
Write-Host "3. You should no longer see security warnings" -ForegroundColor White
Write-Host "4. Look for the lock icon in the address bar" -ForegroundColor White
