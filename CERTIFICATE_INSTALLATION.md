# Certificate Installation Guide

This guide will help you install the CA certificate to your Windows certificate store to eliminate browser security warnings.

## Method 1: Automated Installation (Recommended)

### Option A: Batch File
1. Right-click on `install-certificate.bat`
2. Select "Run as administrator"
3. Follow the prompts

### Option B: PowerShell Script
1. Open PowerShell as Administrator
2. Navigate to your project directory
3. Run: `.\install-certificate.ps1`

## Method 2: Manual Installation

### Step 1: Open Certificate Manager
1. Press `Windows + R` to open Run dialog
2. Type `certmgr.msc` and press Enter
3. This opens the Certificate Manager

### Step 2: Install CA Certificate
1. In the left panel, expand "Trusted Root Certification Authorities"
2. Right-click on "Certificates" folder
3. Select "All Tasks" → "Import..."
4. Click "Next"
5. Click "Browse" and navigate to your project folder
6. Select `certificates/ca.crt`
7. Click "Next"
8. Select "Place all certificates in the following store"
9. Verify "Trusted Root Certification Authorities" is selected
10. Click "Next"
11. Click "Finish"
12. Click "Yes" when prompted about security warning

### Step 3: Install for Current User (Optional)
1. Press `Windows + R`
2. Type `certlm.msc` and press Enter
3. In the left panel, expand "Trusted Root Certification Authorities"
4. Right-click on "Certificates" folder
5. Select "All Tasks" → "Import..."
6. Follow the same steps as above, selecting `certificates/ca.crt`

## Method 3: Command Line Installation

### As Administrator:
```cmd
certlm.msc
```

Then follow the manual steps above.

### PowerShell (Run as Administrator):
```powershell
Import-Certificate -FilePath "certificates\ca.crt" -CertStoreLocation Cert:\LocalMachine\Root
Import-Certificate -FilePath "certificates\ca.crt" -CertStoreLocation Cert:\CurrentUser\Root
```

## Verification

After installation:

1. **Restart your browser** (important!)
2. Navigate to `https://localhost:3000`
3. You should no longer see security warnings
4. The lock icon should appear in the address bar

## Troubleshooting

### Still seeing warnings?
1. Make sure you restarted your browser completely
2. Clear browser cache and cookies for localhost
3. Try a different browser
4. Check if the certificate was installed correctly:
   - Open `certmgr.msc`
   - Look in "Trusted Root Certification Authorities" → "Certificates"
   - You should see a certificate with "localhost" in the name

### Certificate not found?
1. Regenerate certificates:
   ```bash
   npx mkcert create-ca
   npx mkcert create-cert --key certificates/localhost-key.pem --cert certificates/localhost.pem --domains localhost,127.0.0.1,::1
   ```
2. Try the installation again

### Browser still shows "Not Secure"?
1. Check that you're using `https://` not `http://`
2. Make sure the HTTPS server is running: `yarn dev:https`
3. Try incognito/private browsing mode

## Security Notes

- This certificate is only for local development
- Never use these certificates in production
- The certificate is valid for localhost, 127.0.0.1, and ::1 only
- You can remove the certificate anytime from Certificate Manager

## Removing the Certificate

If you want to remove the certificate later:

1. Open `certmgr.msc`
2. Navigate to "Trusted Root Certification Authorities" → "Certificates"
3. Find the certificate (look for "localhost" or the CA name)
4. Right-click and select "Delete"
5. Confirm deletion

