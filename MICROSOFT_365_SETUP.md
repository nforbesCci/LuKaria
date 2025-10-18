# Microsoft 365 Integration Setup

This document explains how to set up Microsoft 365 integration for PDF storage and email functionality in the Lab Requisition system.

## Prerequisites

1. Microsoft 365 Business or Enterprise account
2. Admin access to Azure Active Directory
3. SharePoint Online site

## Step 1: Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `LuKaria Lab Requisition System`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank for now
5. Click **Register**

## Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions** and add:
   - `Mail.Send` - Send mail as any user
   - `Sites.ReadWrite.All` - Read and write items in all site collections
   - `User.Read.All` - Read all users' full profiles
5. Click **Grant admin consent** (requires admin privileges)

## Step 3: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description: `LuKaria Lab Requisition Secret`
4. Set expiration (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the secret value immediately - it won't be shown again

## Step 4: Get SharePoint Site ID

1. Go to your SharePoint site where you want to store PDFs
2. Go to **Settings** > **Site information**
3. Copy the **Site ID** (GUID format)

## Step 5: Environment Configuration

Add the following variables to your `.env.local` file:

```bash
# Microsoft 365 Configuration
MS365_CLIENT_ID=your-application-client-id
MS365_CLIENT_SECRET=your-client-secret-value
MS365_TENANT_ID=your-tenant-id
MS365_EMAIL_FROM=kadriaf@lukariagroup.com
MS365_EMAIL_TO=kadriaf@lukariagroup.com
MS365_SHAREPOINT_SITE_ID=your-sharepoint-site-id
```

### Finding Your Tenant ID

1. In Azure Portal, go to **Azure Active Directory** > **Overview**
2. Copy the **Tenant ID**

### Finding Your Client ID

1. In your app registration, go to **Overview**
2. Copy the **Application (client) ID**

## Step 6: Create SharePoint Folder Structure

1. In your SharePoint site, create a document library called "Lab Requisitions"
2. Set appropriate permissions for the app to read/write to this library

## Step 7: Test the Integration

1. Start your development server: `yarn dev`
2. Navigate to the Lab Requisition page
3. Fill out the form
4. Click the **Send** button
5. Check that:
   - PDF is uploaded to SharePoint
   - Email is sent with PDF attachment
   - Success message appears

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify client ID, secret, and tenant ID are correct
   - Ensure admin consent has been granted for all permissions

2. **SharePoint Upload Errors**
   - Verify the SharePoint site ID is correct
   - Ensure the "Lab Requisitions" document library exists
   - Check that the app has write permissions

3. **Email Send Errors**
   - Verify the email addresses are correct
   - Ensure the sending account has a valid license
   - Check that Mail.Send permission is granted

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```bash
DEBUG=msal:*
```

## Security Considerations

1. **Client Secret**: Store securely and rotate regularly
2. **Permissions**: Use least privilege principle
3. **Network**: Ensure HTTPS is used in production
4. **Monitoring**: Monitor for unusual activity in Azure logs

## Production Deployment

1. Update environment variables in your production environment
2. Ensure all Microsoft 365 services are accessible from your production server
3. Test the integration thoroughly before going live
4. Set up monitoring and alerting for failed operations

## Support

For issues with this integration, check:
1. Azure AD audit logs
2. SharePoint audit logs
3. Application logs in your Next.js app
4. Microsoft Graph API documentation
