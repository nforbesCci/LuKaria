import { call, put, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { 
  generatePdfStart, 
  generatePdfSuccess, 
  generatePdfFailure,
  sendPdfStart,
  sendPdfSuccess,
  sendPdfFailure,
} from '../slices/pdfSlice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from HTML content
function* generatePdfSaga(action) {
  try {
    const { elementId } = action.payload;
    
    // Get the form content element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Form element not found');
    }

    // Create canvas from HTML content
    const canvas = yield call(html2canvas, element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Calculate dimensions for letter size
    const imgWidth = 210; // A4 width in mm (close to letter)
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with compression
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // If content is too tall, scale it down to fit one page while maintaining aspect ratio
    if (imgHeight > pageHeight) {
      const scaleFactor = pageHeight / imgHeight;
      const scaledWidth = imgWidth * scaleFactor;
      const scaledHeight = pageHeight;
      const xOffset = (imgWidth - scaledWidth) / 2;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    } else {
      // Content fits on one page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    }

    // Convert PDF to base64
    const pdfOutput = pdf.output('datauristring');
    const base64Data = pdfOutput.split(',')[1];
    
    yield put(generatePdfSuccess({ base64Data }));
  } catch (error) {
    console.error('Error generating PDF:', error);
    yield put(generatePdfFailure(error.message));
  }
}

// Send PDF via Microsoft 365
function* sendPdfSaga(action) {
  try {
    const { pdfBlob, fileName, userInfo } = action.payload;
    
    // Prepare the request payload
    const payload = {
      pdfData: pdfBlob.base64Data,
      fileName: fileName || `Lab-Requisition-${new Date().toISOString().split('T')[0]}.pdf`,
    };

    // Send to API route
    const response = yield call(fetch, '/api/pdf/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      throw new Error(errorData.error || 'Failed to send PDF');
    }

    const result = yield response.json();
    yield put(sendPdfSuccess(result));
  } catch (error) {
    console.error('Error sending PDF:', error);
    yield put(sendPdfFailure(error.message));
  }
}

// Combined saga for generating and sending PDF
function* generateAndSendPdfSaga(action) {
  try {
    const { elementId, fileName, userInfo } = action.payload;
    
    // First generate the PDF
    yield put(generatePdfStart({ elementId }));
    
    // Wait for PDF generation to complete
    const generateAction = yield take('pdf/generatePdfSuccess');
    const { base64Data } = generateAction.payload;
    
    // Then send the PDF
    yield put(sendPdfStart({ pdfBlob: { base64Data }, fileName, userInfo }));
    
    // Wait for send to complete
    yield take('pdf/sendPdfSuccess');
    
  } catch (error) {
    console.error('Error in generate and send PDF saga:', error);
    yield put(sendPdfFailure(error.message));
  }
}

export function* pdfSaga() {
  yield takeEvery('pdf/generatePdfStart', generatePdfSaga);
  yield takeEvery('pdf/sendPdfStart', sendPdfSaga);
  yield takeLatest('pdf/generateAndSendPdf', generateAndSendPdfSaga);
}
