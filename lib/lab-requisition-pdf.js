import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Printable content width in CSS pixels (~letter body at 96dpi). */
export const LAB_REQUISITION_PRINT_WIDTH_PX = 816;

/**
 * Capture `#lab-requisition-content` (or any element) into a letter-size PDF
 * that fills the page width. Tall content spills onto additional pages instead
 * of shrinking with side gutters.
 *
 * @param {HTMLElement} element
 * @returns {Promise<import('jspdf').jsPDF>}
 */
export async function captureLabRequisitionPdf(element) {
  if (!element) {
    throw new Error('Form element not found');
  }

  const previous = {
    maxWidth: element.style.maxWidth,
    width: element.style.width,
    margin: element.style.margin,
    boxSizing: element.style.boxSizing,
  };

  element.style.maxWidth = `${LAB_REQUISITION_PRINT_WIDTH_PX}px`;
  element.style.width = `${LAB_REQUISITION_PRINT_WIDTH_PX}px`;
  element.style.margin = '0 auto';
  element.style.boxSizing = 'border-box';

  // Let layout settle before rasterizing.
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
    element.style.maxWidth = previous.maxWidth;
    element.style.width = previous.width;
    element.style.margin = previous.margin;
    element.style.boxSizing = previous.boxSizing;
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');

  if (imgHeight <= usableHeight) {
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    return pdf;
  }

  // Slice the canvas across pages at full width (no side gutters / no shrink).
  const pageCanvas = document.createElement('canvas');
  const pageCtx = pageCanvas.getContext('2d');
  const pxPerMm = canvas.width / imgWidth;
  const pageHeightPx = Math.floor(usableHeight * pxPerMm);
  pageCanvas.width = canvas.width;

  let srcY = 0;
  let pageIndex = 0;
  while (srcY < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - srcY);
    pageCanvas.height = sliceHeight;
    pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageCtx.drawImage(
      canvas,
      0,
      srcY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    const sliceHeightMm = sliceHeight / pxPerMm;
    const sliceData = pageCanvas.toDataURL('image/png');
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(sliceData, 'PNG', margin, margin, imgWidth, sliceHeightMm);

    srcY += sliceHeight;
    pageIndex += 1;
  }

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
