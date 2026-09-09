import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Legacy wide capture (original lab requisition). */
export const LAB_REQUISITION_PRINT_WIDTH_PX = 1100;

/** Letter body width at 96dpi for LRF01-style forms. */
export const LAB_REQUISITION_LETTER_WIDTH_PX = 816;

const CAPTURE_STYLE_ID = 'lab-requisition-pdf-capture-style';

function injectCaptureStyles() {
  if (document.getElementById(CAPTURE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CAPTURE_STYLE_ID;
  style.textContent = `
    #lab-requisition-content.lab-req-pdf-capture .MuiPaper-root { padding: 4px !important; }
    #lab-requisition-content.lab-req-pdf-capture .MuiCard-root { margin-bottom: 4px !important; }
    #lab-requisition-content.lab-req-pdf-capture .MuiCardContent-root { padding: 4px 6px !important; }
    #lab-requisition-content.lab-req-pdf-capture .lab-signature-img,
    #lab-requisition-content.lab-req-pdf-capture .lrf-sig img {
      max-height: 40px !important;
      height: auto !important;
    }
  `;
  document.head.appendChild(style);
}

function removeCaptureStyles() {
  document.getElementById(CAPTURE_STYLE_ID)?.remove();
}

/**
 * @param {HTMLElement} element
 * @param {{ mode?: 'fillPage' | 'letterFit' }} [options]
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export async function captureLabRequisitionPdf(element, options = {}) {
  if (!element) {
    throw new Error('Form element not found');
  }

  const mode = options.mode === 'letterFit' ? 'letterFit' : 'fillPage';
  injectCaptureStyles();

  const previous = {
    maxWidth: element.style.maxWidth,
    width: element.style.width,
    margin: element.style.margin,
    boxSizing: element.style.boxSizing,
  };

  const captureWidth =
    mode === 'letterFit'
      ? LAB_REQUISITION_LETTER_WIDTH_PX
      : Math.max(
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
      onclone: (_doc, cloned) => {
        // Materialize native input values — html2canvas often skips them.
        cloned.querySelectorAll('input').forEach((input) => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            if (input.checked) input.setAttribute('checked', 'checked');
            else input.removeAttribute('checked');
            return;
          }
          const doc = input.ownerDocument;
          const text = doc.createElement('span');
          text.textContent = input.value || '';
          text.setAttribute(
            'style',
            [
              'display:inline-block',
              'width:100%',
              'color:#000',
              'font-size:7.5pt',
              'font-weight:600',
              'border-bottom:1px solid #000',
              'min-height:11px',
              'padding:0 2px',
              'box-sizing:border-box',
              'white-space:pre-wrap',
            ].join(';'),
          );
          input.parentNode?.replaceChild(text, input);
        });
      },
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
  const margin = mode === 'letterFit' ? 4 : 5;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imgData = canvas.toDataURL('image/jpeg', 0.93);

  if (mode === 'fillPage') {
    // Original form: stretch to fill printable area.
    pdf.addImage(imgData, 'JPEG', margin, margin, usableWidth, usableHeight);
    return pdf;
  }

  // LRF01: fit width, shrink uniformly to one page if slightly tall (no side strip).
  let drawWidth = usableWidth;
  let drawHeight = (canvas.height * drawWidth) / canvas.width;
  if (drawHeight > usableHeight) {
    const scale = usableHeight / drawHeight;
    drawHeight = usableHeight;
    drawWidth = usableWidth * scale;
  }
  const xOffset = margin + (usableWidth - drawWidth) / 2;
  pdf.addImage(imgData, 'JPEG', xOffset, margin, drawWidth, drawHeight);
  return pdf;
}

/**
 * @param {HTMLElement} element
 * @param {{ mode?: 'fillPage' | 'letterFit' }} [options]
 * @returns {Promise<string>}
 */
export async function captureLabRequisitionPdfBase64(element, options = {}) {
  const pdf = await captureLabRequisitionPdf(element, options);
  const dataUri = pdf.output('datauristring');
  return dataUri.split(',')[1];
}
