import { call, put, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { 
  generatePdfStart, 
  generatePdfSuccess, 
  generatePdfFailure,
  sendPdfStart,
  sendPdfSuccess,
  sendPdfFailure,
} from '../slices/pdfSlice';
import { captureLabRequisitionPdfBase64 } from '../../lib/lab-requisition-pdf';

// Generate PDF from HTML content
function* generatePdfSaga(action) {
  try {
    const { elementId, captureOptions } = action.payload;
    
    // Get the form content element
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Form element not found');
    }

    const base64Data = yield call(captureLabRequisitionPdfBase64, element, captureOptions || {});
    
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
      userInfo: userInfo,
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
    const { elementId, fileName, userInfo, captureOptions } = action.payload;
    
    // First generate the PDF
    yield put(generatePdfStart({ elementId, captureOptions }));
    
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
