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

    const response = await cca.acquireTokenSilent(clientCredentialRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw new Error('Failed to acquire access token');
  }
}

// Upload PDF to SharePoint
async function uploadToSharePoint(pdfBuffer, fileName) {
  try {
    const accessToken = await getAccessToken();
    
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Upload to SharePoint document library
    const uploadResponse = await graphClient
      .sites(process.env.MS365_SHAREPOINT_SITE_ID)
      .drives('root')
      .items('Lab Requisitions')
      .children
      .post({
        name: fileName,
        file: {
          content: pdfBuffer,
        },
      });

    return uploadResponse.webUrl;
  } catch (error) {
    console.error('Error uploading to SharePoint:', error);
    throw new Error('Failed to upload PDF to SharePoint');
  }
}

// Send email with PDF attachment
async function sendEmailWithAttachment(pdfBuffer, fileName, uploadUrl) {
  try {
    const accessToken = await getAccessToken();
    
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    // Convert PDF buffer to base64
    const base64Content = pdfBuffer.toString('base64');

    const message = {
      subject: `Lab Requisition - ${fileName}`,
      body: {
        contentType: 'HTML',
        content: `
          <p>Dear Dr. Fairclough,</p>
          <p>Please find attached the lab requisition form.</p>
          <p>The document has also been saved to SharePoint: <a href="${uploadUrl}">View in SharePoint</a></p>
          <p>Best regards,<br>Svelte by LuKaria System</p>
        `,
      },
      toRecipients: [
        {
          emailAddress: {
            address: process.env.MS365_EMAIL_TO,
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

    await graphClient
      .users(process.env.MS365_EMAIL_FROM)
      .sendMail({
        message: message,
        saveToSentItems: true,
      })
      .post();

    return { success: true, uploadUrl };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function POST(request) {
  try {
    const { pdfData, fileName } = await request.json();

    if (!pdfData || !fileName) {
      return NextResponse.json(
        { error: 'PDF data and filename are required' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');

    // Upload to SharePoint
    const uploadUrl = await uploadToSharePoint(pdfBuffer, fileName);

    // Send email with attachment
    const result = await sendEmailWithAttachment(pdfBuffer, fileName, uploadUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PDF send API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
