import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Capture near the on-screen form width so checkbox grids stay readable,
 * then stretch onto a full letter page (no side gutters).
 */
export const LAB_REQUISITION_PRINT_WIDTH_PX = 1100;

const CAPTURE_STYLE_ID = 'lab-requisition-pdf-capture-style';

function injectCaptureStyles() {
  if (document.getElementById(CAPTURE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CAPTURE_STYLE_ID;
  style.textContent = `
    #lab-requisition-content.lab-req-pdf-capture .MuiPaper-root {
      padding: 4px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiCard-root {
      margin-bottom: 4px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiCardContent-root {
      padding: 4px 6px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiTypography-h6 {
      font-size: 0.85rem !important;
      margin-bottom: 4px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiTypography-subtitle1 {
      font-size: 0.8rem !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiTypography-body2,
    #lab-requisition-content.lab-req-pdf-capture .MuiTypography-root {
      font-size: 0.75rem !important;
      line-height: 1.15 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .pdf-header .MuiTypography-root {
      font-size: 1.6rem !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root,
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root .MuiFormControlLabel-label,
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root .MuiTypography-root {
      font-size: 0.72rem !important;
      line-height: 1.15 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .lab-signature-box {
      min-height: 72px !important;
      padding: 8px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .lab-signature-img {
      max-height: 56px !important;
      height: auto !important;
    }
  `;
  document.head.appendChild(style);
}

function removeCaptureStyles() {
  document.getElementById(CAPTURE_STYLE_ID)?.remove();
}

/**
 * Capture lab requisition HTML into a single letter-size PDF that uses the
 * full page width and height (no large side gutters / no tiny centered strip).
 *
 * @param {HTMLElement} element
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export async function captureLabRequisitionPdf(element) {
  if (!element) {
    throw new Error('Form element not found');
  }

  injectCaptureStyles();

  const previous = {
    maxWidth: element.style.maxWidth,
    width: element.style.width,
    margin: element.style.margin,
    boxSizing: element.style.boxSizing,
  };

  const captureWidth = Math.max(
    LAB_REQUISITION_PRINT_WIDTH_PX,
    Math.min(element.scrollWidth || LAB_REQUISITION_PRINT_WIDTH_PX, 1200),
  );

  element.classList.add('lab-req-pdf-capture');
  element.style.maxWidth = `${captureWidth}px`;
  element.style.width = `${captureWidth}px`;
  element.style.margin = '0 auto';
  element.style.boxSizing = 'border-box';

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  let canvas;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: captureWidth,
      windowWidth: captureWidth,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    element.classList.remove('lab-req-pdf-capture');
    element.style.maxWidth = previous.maxWidth;
    element.style.width = previous.width;
    element.style.margin = previous.margin;
    element.style.boxSizing = previous.boxSizing;
    removeCaptureStyles();
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 5;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Fill the entire printable area so the form is large and side gutters are gone.
  // Mild vertical compression is preferable to a tiny centered strip.
  const imgData = canvas.toDataURL('image/jpeg', 0.93);
  pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, usableHeight);

  return pdf;
}

/**
 * @param {HTMLElement} element
 * @returns {Promise<string>} base64 PDF bytes (no data-URI prefix)
 */
export async function captureLabRequisitionPdfBase64(element) {
  const pdf = await captureLabRequisitionPdf(element);
  const dataUri = pdf.output('datauristring');
  return dataUri.split(',')[1];
}
