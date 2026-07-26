import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getCollection } from '../../../../lib/mongodb';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';

export async function PUT(request) {
  console.log('🔄 API Route Called: PUT /api/appointment/update');

  try {
    const session = await getApiSession(request);

    if (!session || !session.user) {
      console.warn('❌ Unauthorized request to update appointment');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const body = await request.json().catch(() => ({}));
    const appointmentData = body?.appointmentData;

    if (!appointmentData || typeof appointmentData !== 'object') {
      console.warn('⚠️ Missing appointment data in update request');
      return NextResponse.json({ success: false, error: 'Appointment data is required' }, { status: 400 });
    }

    const appointmentsCollection = await getCollection('appointments');
    const existingAppointment = await appointmentsCollection.findOne({ userId });

    if (!existingAppointment) {
      console.warn('⚠️ No existing appointment found for user:', userId);
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    const updateDocument =  {
        isScheduled: false,
        rawData: {
            startDate: null,
            endDate: null
        },
        length: 0,
        date: null,
        time: null,
        type: null,
        provider: null,
        notes: null,
        updatedAt: new Date(),
        rescheduleRequested: false,
        rescheduleRequestedAt: null
    };

    console.log('💾 Updating appointment for user:', userId, JSON.stringify(updateDocument, null, 2));

    const result = await appointmentsCollection.updateOne(
      { userId },
      { $set: updateDocument }
    );

    console.log('✅ Appointment update result:', result);

    await sendEmail(appointmentData, session.user.name);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        appointment: {
          ...existingAppointment,
          ...updateDocument,
        },
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update appointment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

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

async function sendEmail(appointmentData, userName) {
    try {
      const accessToken = await getAccessToken();
      console.log('Access token acquired for email');
      
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
  
      
      const message = {
        subject: `Appointment cancelled for user ${userName} at ${appointmentData.date.toString().slice(0, 10)} ${appointmentData.time}`,
        body: {
          contentType: 'HTML',
          content: `
            
            <p>Please cancel the appointment for user ${userName} at ${appointmentData.date.toString().slice(0, 10)} ${appointmentData.time}</p>
          `,
        },
        toRecipients: [
          {
            emailAddress: {
              address: "svelte@lukariagroup.com",
              name: "svelte"
            },
          },
        ],
        
      };
  
      console.log('Sending email with message:', JSON.stringify(message, null, 2));
  
      await graphClient
        .api(`/users/${process.env.MS365_EMAIL_FROM}/sendMail`)
        .post({
          message: message,
          saveToSentItems: false,
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