import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { patient, doctor, reportData } = await request.json();

    // Validate required fields
    if (!patient?.name || !patient?.email || !doctor?.email) {
      return NextResponse.json(
        { error: 'Missing required patient or doctor information' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Validate the patient has this doctor assigned
    // 2. Send email using a service like SendGrid, AWS SES, or Nodemailer
    // 3. Log the report in a database
    // 4. Send notifications to the doctor's system

    // For now, we'll simulate the email sending
    console.log('Sending side effects report:', {
      to: doctor.email,
      from: patient.email,
      subject: `Side Effects Report from ${patient.name}`,
      reportData
    });

    // Simulate email content
    const emailContent = {
      to: doctor.email,
      from: process.env.FROM_EMAIL || 'noreply@healthcare.com',
      subject: `Side Effects Report from ${patient.name}`,
      html: generateEmailHTML(patient, doctor, reportData),
      text: generateEmailText(patient, doctor, reportData)
    };

    // Here you would integrate with your email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailContent);

    // Example with Nodemailer:
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransporter({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // });
    // await transporter.sendMail(emailContent);

    // Log the report (in a real app, save to database)
    console.log('Side effects report logged:', {
      reportId: reportData.reportId,
      patientId: patient.id,
      doctorEmail: doctor.email,
      timestamp: reportData.reportDate,
      sideEffects: reportData.sideEffects,
      hasConcerns: reportData.hasTreatmentConcerns === 'yes',
      requestContact: reportData.requestDoctorContact
    });

    return NextResponse.json({
      success: true,
      message: 'Side effects report sent successfully',
      reportId: reportData.reportId
    });

  } catch (error) {
    console.error('Error sending side effects report:', error);
    return NextResponse.json(
      { error: 'Failed to send side effects report' },
      { status: 500 }
    );
  }
}

function generateEmailHTML(patient, doctor, reportData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #1976d2; background-color: #f5f5f5; }
        .side-effect { display: inline-block; background-color: #ff9800; color: white; padding: 5px 10px; margin: 5px; border-radius: 15px; }
        .urgent { border-left-color: #f44336; background-color: #ffebee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Side Effects Report</h1>
        <p>Patient: ${patient.name} (${patient.email})</p>
        <p>Report ID: ${reportData.reportId}</p>
        <p>Date: ${new Date(reportData.reportDate).toLocaleDateString()}</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>Reported Side Effects</h3>
          ${reportData.sideEffects.length > 0 
            ? reportData.sideEffects.map(effect => `<span class="side-effect">${effect}</span>`).join('')
            : '<p>No predefined side effects reported</p>'
          }
          ${reportData.otherSideEffect ? `<p><strong>Other side effects:</strong> ${reportData.otherSideEffect}</p>` : ''}
        </div>

        <div class="section">
          <h3>Appetite</h3>
          <p>Appetite suppressed: ${reportData.appetiteSuppressed || 'Not specified'}</p>
        </div>

        ${reportData.hasTreatmentConcerns === 'yes' ? `
        <div class="section urgent">
          <h3>⚠️ Treatment Concerns</h3>
          <p>${reportData.treatmentConcerns}</p>
        </div>
        ` : ''}

        ${reportData.requestDoctorContact ? `
        <div class="section urgent">
          <h3>📞 Contact Request</h3>
          <p><strong>Patient requests doctor contact</strong></p>
          ${reportData.contactMessage ? `<p><strong>Additional message:</strong> ${reportData.contactMessage}</p>` : ''}
        </div>
        ` : ''}

        <div class="section">
          <h3>Next Steps</h3>
          <p>Please review this report and contact the patient if necessary.</p>
          <p>This report has been automatically logged in the patient's medical record.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(patient, doctor, reportData) {
  return `
Side Effects Report

Patient: ${patient.name} (${patient.email})
Report ID: ${reportData.reportId}
Date: ${new Date(reportData.reportDate).toLocaleDateString()}

Reported Side Effects:
${reportData.sideEffects.length > 0 ? reportData.sideEffects.join(', ') : 'No predefined side effects reported'}
${reportData.otherSideEffect ? `Other side effects: ${reportData.otherSideEffect}` : ''}

Appetite:
Appetite suppressed: ${reportData.appetiteSuppressed || 'Not specified'}

${reportData.hasTreatmentConcerns === 'yes' ? `
Treatment Concerns:
${reportData.treatmentConcerns}
` : ''}

${reportData.requestDoctorContact ? `
Contact Request:
Patient requests doctor contact
${reportData.contactMessage ? `Additional message: ${reportData.contactMessage}` : ''}
` : ''}

Next Steps:
Please review this report and contact the patient if necessary.
This report has been automatically logged in the patient's medical record.
  `;
}
