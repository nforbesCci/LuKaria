import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../lib/api-auth';
import {
  buildSimpleTextPdf,
  sendLabPdfEmail,
  uploadLabPdfToSharePoint,
} from '../../../../lib/ms365-pdf-delivery';

export const dynamic = 'force-dynamic';

/**
 * Mobile / server-rendered lab requisition.
 * Accepts structured JSON (no client html2canvas) and delivers PDF via SharePoint + email.
 *
 * Body:
 * {
 *   patientName, patientEmail, patientDOB, patientSex, patientPhone, patientAddress,
 *   panels: string[] | string,
 *   tests: string[],
 *   notes, diagnosis, orderingProvider
 * }
 */
export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const patientName = body.patientName || body.name || 'Patient';
    const patientEmail =
      body.patientEmail || body.email || process.env.MS365_EMAIL_TO;
    if (!patientEmail) {
      return NextResponse.json(
        { error: 'patientEmail is required' },
        { status: 400 }
      );
    }

    const panels = Array.isArray(body.panels)
      ? body.panels
      : String(body.panels || body.panel || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const tests = Array.isArray(body.tests) ? body.tests : [];

    const lines = [
      `Ordering provider: ${body.orderingProvider || session.user.name || 'Clinic'}`,
      `Patient: ${patientName}`,
      `DOB: ${body.patientDOB || body.dob || '—'}`,
      `Sex: ${body.patientSex || body.sex || '—'}`,
      `Phone: ${body.patientPhone || body.phone || '—'}`,
      `Address: ${body.patientAddress || body.address || '—'}`,
      `User ID: ${body.userId || '—'}`,
      '',
      `Panels: ${panels.join(', ') || '—'}`,
      `Tests: ${tests.join(', ') || '—'}`,
      '',
      `Diagnosis / ICD: ${body.diagnosis || '—'}`,
      `Notes: ${body.notes || '—'}`,
      '',
      `Generated: ${new Date().toISOString()}`,
      `Requested by: ${session.user.email || session.user.sub}`,
    ];

    const pdfBuffer = buildSimpleTextPdf('Lab Requisition — Svelte by LuKaria', lines);
    const safeName = patientName.replace(/[^\w.-]+/g, '_').slice(0, 40);
    const fileName = `LabRequisition_${safeName}_${Date.now()}.pdf`;

    await uploadLabPdfToSharePoint(pdfBuffer, fileName);
    await sendLabPdfEmail(pdfBuffer, fileName, patientEmail, patientName);

    return NextResponse.json({
      success: true,
      fileName,
      message: 'Lab requisition PDF uploaded and emailed',
    });
  } catch (error) {
    console.error('Lab requisition PDF error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lab requisition' },
      { status: 500 }
    );
  }
}
