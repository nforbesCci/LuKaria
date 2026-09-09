import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Capture width that stays close to letter aspect after one-page fit. */
export const LAB_REQUISITION_PRINT_WIDTH_PX = 816;

const CAPTURE_STYLE_ID = 'lab-requisition-pdf-capture-style';

function injectCaptureStyles() {
  if (document.getElementById(CAPTURE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CAPTURE_STYLE_ID;
  style.textContent = `
    #lab-requisition-content.lab-req-pdf-capture,
    #lab-requisition-content.lab-req-pdf-capture * {
      line-height: 1.05 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiPaper-root {
      padding: 2px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiCard-root {
      margin-bottom: 2px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiCardContent-root {
      padding: 2px 4px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiBox-root {
      margin-bottom: 2px !important;
      padding-top: 2px !important;
      padding-bottom: 2px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiTypography-root {
      font-size: 0.7rem !important;
      margin-bottom: 1px !important;
      line-height: 1.05 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .pdf-header .MuiTypography-root {
      font-size: 1.4rem !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root,
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root .MuiFormControlLabel-label,
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root .MuiTypography-root {
      font-size: 0.65rem !important;
      line-height: 1.05 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiFormControlLabel-root {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .MuiGrid-container {
      /* keep grid gutters modest for one-page fit */
    }
    #lab-requisition-content.lab-req-pdf-capture .lab-signature-box {
      min-height: 56px !important;
      padding-top: 4px !important;
      padding-bottom: 4px !important;
    }
    #lab-requisition-content.lab-req-pdf-capture .lab-signature-img {
      max-height: 48px !important;
      height: 48px !important;
    }
  `;
  document.head.appendChild(style);
}

function removeCaptureStyles() {
  document.getElementById(CAPTURE_STYLE_ID)?.remove();
}

/**
 * Capture lab requisition HTML into a single letter-size PDF page.
 * Shrinks to fit height when needed, using the full usable width when possible
 * and only modest side margins when height forces a uniform scale-down.
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

  element.classList.add('lab-req-pdf-capture');
  element.style.maxWidth = `${LAB_REQUISITION_PRINT_WIDTH_PX}px`;
  element.style.width = `${LAB_REQUISITION_PRINT_WIDTH_PX}px`;
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
      width: LAB_REQUISITION_PRINT_WIDTH_PX,
      windowWidth: LAB_REQUISITION_PRINT_WIDTH_PX,
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
  const margin = 6;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Fit entire form on one page, preserving aspect ratio.
  let drawWidth = usableWidth;
  let drawHeight = (canvas.height * drawWidth) / canvas.width;
  if (drawHeight > usableHeight) {
    const scale = usableHeight / drawHeight;
    drawHeight = usableHeight;
    drawWidth = usableWidth * scale;
  }

  const xOffset = margin + (usableWidth - drawWidth) / 2;
  const yOffset = margin + Math.max(0, (usableHeight - drawHeight) / 2);
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, drawWidth, drawHeight);

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
