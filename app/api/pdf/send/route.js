import { NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

// Initialize MSAL
const msalConfig = {
  auth: {
    clientId: process.env.MS365_CLIENT_ID,
    clientSecret: process.env.MS365_CLIENT_SECRET,
    authority: `https://login.microsoftonline.com/${process.env.MS365_TENANT_ID}`,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

// Get access token
async function getAccessToken() {
  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    console.log('Token acquired successfully:', {
      expiresOn: response.expiresOn,
      scopes: response.scopes
    });
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token:', {
      message: error.message,
      code: error.errorCode,
      correlationId: error.correlationId
    });
    throw new Error(`Failed to acquire access token: ${error.message}`);
  }
}

// Upload PDF to SharePoint
async function uploadToSharePoint(pdfBuffer, fileName) {
  try {
    const accessToken = await getAccessToken();
    console.log('Access token acquired successfully');
    
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    console.log('Uploading to SharePoint:', {
      siteId: process.env.MS365_SHAREPOINT_SITE_ID,
      fileName,
      bufferSize: pdfBuffer.length
    });

    // First, let's try to create the folder if it doesn't exist
    try {
      await graphClient
        .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/Lab Requisitions:/children`)
        .get();
      console.log('Lab Requisitions folder exists');
    } catch (folderError) {
      console.log('Lab Requisitions folder does not exist, creating it...');
      try {
        await graphClient
          .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root/children`)
          .post({
            name: 'Lab Requisitions',
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename'
          });
        console.log('Lab Requisitions folder created');
      } catch (createError) {
        console.log('Could not create folder, proceeding with upload anyway');
      }
    }

    // Try multiple upload approaches
    let uploadResponse;
    try {
      // Method 1: Direct upload to root with folder path
      uploadResponse = await graphClient
        .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/Lab Requisitions/${fileName}:/content`)
        .put(pdfBuffer);
    } catch (uploadError) {
      console.log('Method 1 failed, trying method 2:', uploadError.message);
      try {
        // Method 2: Upload to root and move to folder
        uploadResponse = await graphClient
          .api(`/sites/${process.env.MS365_SHAREPOINT_SITE_ID}/drive/root:/${fileName}:/content`)
          .put(pdfBuffer);
      } catch (uploadError2) {
        console.log('Method 2 failed, trying method 3:', uploadError2.message);
        // Method 3: Use the drive ID directly
        const driveId = process.env.MS365_SHAREPOINT_DRIVE_ID || 'root';
        uploadResponse = await graphClient
          .api(`/drives/${driveId}/root:/Lab Requisitions/${fileName}:/content`)
          .put(pdfBuffer);
      }
    }

    console.log('SharePoint upload successful:', uploadResponse);
    return uploadResponse.webUrl;
  } catch (error) {
    console.error('Error uploading to SharePoint:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      body: error.body,
      headers: error.headers
    });
    throw new Error(`Failed to upload PDF to SharePoint: ${error.message}`);
  }
}

// Send email with PDF attachment
async function sendEmailWithAttachment(pdfBuffer, fileName, userEmail, userName) {
  try {
    const accessToken = await getAccessToken();
    console.log('Access token acquired for email');
    
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Convert PDF buffer to base64
    const base64Content = pdfBuffer.toString('base64');
    console.log('Email details:', {
      from: process.env.MS365_EMAIL_FROM,
      to: userEmail,
      fileName,
      attachmentSize: base64Content.length
    });

    const message = {
      subject: `Lab Requisition - ${fileName}`,
      body: {
        contentType: 'HTML',
        content: `
          <p>Dear ${userName},</p>
          <p>Please find attached the lab requisition form for completion at your earliest convenience.</p>
          <p>A Svelte by LuKaria team member will contact you as soon as our physician has received your results.</p>
          <p>Best regards,<br>Svelte by LuKaria</p>
        `,
      },
      toRecipients: [
        {
          emailAddress: {
            address: userEmail,
            name: userName
          },
        },
      ],
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: fileName,
          contentBytes: base64Content,
          contentType: 'application/pdf',
        },
      ],
    };

    console.log('Sending email with message:', JSON.stringify(message, null, 2));

    await graphClient
      .api(`/users/${process.env.MS365_EMAIL_FROM}/sendMail`)
      .post({
        message: message,
        saveToSentItems: true,
      });

    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      body: error.body
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
}



export async function POST(request) {
  try {
    console.log('PDF send API called');
    const { pdfData, fileName, userInfo } = await request.json();

    if (!pdfData || !fileName) {
      console.error('Missing required fields:', { pdfData: !!pdfData, fileName: !!fileName });
      return NextResponse.json(
        { error: 'PDF data and filename are required' },
        { status: 400 }
      );
    }

    console.log('Processing PDF:', { fileName, dataLength: pdfData.length });

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    console.log('PDF buffer created:', { size: pdfBuffer.length });

    await uploadToSharePoint(pdfBuffer, fileName);

    // Send email with attachment
    console.log('Starting email send...');
    const userEmail = userInfo?.email || userInfo?.user_metadata?.email;
    const userName = userInfo?.name || userInfo?.user_metadata?.name || userInfo?.nickname || 'User';
    if (!userEmail) {
      throw new Error('User email not found in user info');
    }
    const result = await sendEmailWithAttachment(pdfBuffer, fileName, userEmail, userName);
    console.log('Email send completed');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PDF send API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
