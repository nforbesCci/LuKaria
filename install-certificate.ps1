# PowerShell script to install the CA certificate to Windows certificate store
# Run this script as Administrator

Write-Host "Installing CA certificate to Windows certificate store..." -ForegroundColor Green

# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$certPath = Join-Path $scriptPath "certificates\ca.crt"

# Check if certificate file exists
if (-not (Test-Path $certPath)) {
    Write-Host "Error: Certificate file not found at $certPath" -ForegroundColor Red
    Write-Host "Please make sure you have generated the certificates first." -ForegroundColor Red
    exit 1
}

try {
    # Import the certificate to the Trusted Root Certification Authorities store
    Write-Host "Importing certificate to Trusted Root Certification Authorities..." -ForegroundColor Yellow
    
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certPath)
    
    # Open the Local Machine certificate store
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::Root, [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine)
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    
    # Add the certificate
    $store.Add($cert)
    
    # Close the store
    $store.Close()
    
    Write-Host "Certificate successfully installed to Trusted Root Certification Authorities!" -ForegroundColor Green
    Write-Host "You may need to restart your browser for the changes to take effect." -ForegroundColor Yellow
    
    # Also install to Current User store as a backup
    Write-Host "Also installing to Current User store..." -ForegroundColor Yellow
    
    $userStore = New-Object System.Security.Cryptography.X509Certificates.X509Store([System.Security.Cryptography.X509Certificates.StoreName]::Root, [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser)
    $userStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $userStore.Add($cert)
    $userStore.Close()
    
    Write-Host "Certificate also installed to Current User store!" -ForegroundColor Green
    
} catch {
    Write-Host "Error installing certificate: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you are running this script as Administrator." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Please restart your browser and try accessing https://localhost:3000 again." -ForegroundColor Yellow

