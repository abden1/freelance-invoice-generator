import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoicePDFData {
  number: string;
  issueDate: string | Date;
  dueDate: string | Date;
  currency: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  user: {
    name?: string | null;
    companyName?: string | null;
    companyAddress?: string | null;
    companyCity?: string | null;
    companyCountry?: string | null;
    email: string;
    taxId?: string | null;
    vatNumber?: string | null;
    brandColor?: string;
  };
  client: {
    name: string;
    company?: string | null;
    email: string;
    address?: string | null;
    city?: string | null;
    country?: string | null;
  };
}

// Parse hex color to rgb(0-1) values
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// Wrap text into lines that fit within maxWidth
function wrapText(text: string, font: import("pdf-lib").PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;

  const primaryColor = hexToRgb(data.user.brandColor || "#4F46E5");
  const grayColor = rgb(0.42, 0.45, 0.5);
  const darkColor = rgb(0.07, 0.09, 0.15);
  const lightGray = rgb(0.95, 0.96, 0.96);

  let y = height - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts: {
      font?: import("pdf-lib").PDFFont;
      size?: number;
      color?: import("pdf-lib").Color;
      maxWidth?: number;
    } = {}
  ) => {
    const { font = fontRegular, size = 10, color = darkColor } = opts;
    const safeText = (text ?? "").toString();
    page.drawText(safeText, { x, y: yPos, font, size, color });
  };

  // ── Company name (top left)
  const companyDisplay = data.user.companyName || data.user.name || data.user.email;
  drawText(companyDisplay, margin, y, { font: fontBold, size: 18, color: primaryColor });

  // ── "INVOICE" title (top right)
  const titleWidth = fontBold.widthOfTextAtSize("INVOICE", 28);
  drawText("INVOICE", width - margin - titleWidth, y, { font: fontBold, size: 28, color: primaryColor });

  y -= 20;

  // Company details
  const companyParts = [data.user.companyAddress, data.user.companyCity, data.user.companyCountry].filter(Boolean);
  if (companyParts.length) {
    drawText(companyParts.join(", "), margin, y, { size: 9, color: grayColor });
    y -= 13;
  }
  drawText(data.user.email, margin, y, { size: 9, color: grayColor });
  y -= 13;
  if (data.user.taxId) {
    drawText(`Tax ID: ${data.user.taxId}`, margin, y, { size: 8, color: grayColor });
    y -= 13;
  }

  // Invoice number (under INVOICE title)
  const numText = `#${data.number}`;
  const numWidth = fontRegular.widthOfTextAtSize(numText, 11);
  drawText(numText, width - margin - numWidth, height - margin - 35, { size: 11, color: grayColor });

  y -= 10;

  // ── Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.9, 0.91, 0.92),
  });
  y -= 20;

  // ── Bill To (left) + Dates (right)
  const billY = y;
  drawText("BILL TO", margin, billY, { font: fontBold, size: 8, color: grayColor });
  y -= 15;
  drawText(data.client.company || data.client.name, margin, y, { font: fontBold, size: 11 });
  y -= 14;
  if (data.client.company) {
    drawText(data.client.name, margin, y, { size: 10, color: grayColor });
    y -= 13;
  }
  drawText(data.client.email, margin, y, { size: 10, color: grayColor });
  y -= 13;
  const clientAddr = [data.client.address, data.client.city, data.client.country].filter(Boolean).join(", ");
  if (clientAddr) {
    drawText(clientAddr, margin, y, { size: 10, color: grayColor });
    y -= 13;
  }

  // Dates (right column)
  const dateX = width - margin - 160;
  drawText("ISSUE DATE", dateX, billY, { font: fontBold, size: 8, color: grayColor });
  drawText(formatDate(data.issueDate), dateX, billY - 14, { size: 10 });
  drawText("DUE DATE", dateX, billY - 34, { font: fontBold, size: 8, color: grayColor });
  drawText(formatDate(data.dueDate), dateX, billY - 48, { size: 10 });
  if (data.paymentTerms) {
    drawText("PAYMENT TERMS", dateX, billY - 68, { font: fontBold, size: 8, color: grayColor });
    drawText(data.paymentTerms, dateX, billY - 82, { size: 10 });
  }

  y -= 20;

  // ── Second divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.9, 0.91, 0.92),
  });
  y -= 5;

  // ── Table header background
  const tableHeaderH = 22;
  page.drawRectangle({
    x: margin,
    y: y - tableHeaderH,
    width: contentWidth,
    height: tableHeaderH,
    color: lightGray,
  });

  const col = {
    desc: margin + 6,
    qty: margin + contentWidth * 0.6,
    rate: margin + contentWidth * 0.75,
    amount: margin + contentWidth * 0.88,
  };

  y -= 8;
  drawText("DESCRIPTION", col.desc, y, { font: fontBold, size: 8, color: grayColor });
  drawText("QTY", col.qty, y, { font: fontBold, size: 8, color: grayColor });
  drawText("RATE", col.rate, y, { font: fontBold, size: 8, color: grayColor });
  drawText("AMOUNT", col.amount, y, { font: fontBold, size: 8, color: grayColor });
  y -= tableHeaderH - 8;

  // ── Line items
  for (const item of data.items) {
    const descLines = wrapText(item.description, fontRegular, 10, contentWidth * 0.55);
    const rowHeight = Math.max(20, descLines.length * 14);

    let lineY = y - 6;
    for (const line of descLines) {
      drawText(line, col.desc, lineY, { size: 10 });
      lineY -= 14;
    }
    drawText(String(item.quantity), col.qty, y - 6, { size: 10 });
    drawText(formatCurrency(Number(item.rate), data.currency), col.rate, y - 6, { size: 10 });
    drawText(formatCurrency(Number(item.amount), data.currency), col.amount, y - 6, { size: 10 });

    y -= rowHeight;

    // Row separator
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.3,
      color: lightGray,
    });
  }

  y -= 20;

  // ── Totals (right-aligned)
  const totalsX = width - margin - 200;
  const valX = width - margin - 5;

  const drawTotalRow = (
    label: string,
    value: string,
    bold = false,
    color: import("pdf-lib").Color = darkColor
  ) => {
    const font = bold ? fontBold : fontRegular;
    const size = bold ? 11 : 10;
    drawText(label, totalsX, y, { font: fontRegular, size, color: grayColor });
    const vw = font.widthOfTextAtSize(value, size);
    drawText(value, valX - vw, y, { font, size, color });
    y -= bold ? 18 : 16;
  };

  drawTotalRow("Subtotal", formatCurrency(data.subtotal, data.currency));
  if (data.discountAmount > 0) {
    const label = data.discountType === "PERCENT" ? `Discount (${data.discountValue}%)` : "Discount";
    drawTotalRow(label, `-${formatCurrency(data.discountAmount, data.currency)}`, false, rgb(0.06, 0.72, 0.51));
  }
  if (data.taxAmount > 0) {
    drawTotalRow(`Tax (${data.taxRate}%)`, formatCurrency(data.taxAmount, data.currency));
  }

  // Grand total line
  page.drawLine({
    start: { x: totalsX, y: y + 4 },
    end: { x: width - margin, y: y + 4 },
    thickness: 1.5,
    color: primaryColor,
  });
  y -= 8;
  drawTotalRow("Total Due", formatCurrency(data.total, data.currency), true, primaryColor);

  // ── Notes
  if (data.notes) {
    y -= 16;
    page.drawRectangle({ x: margin, y: y - 50, width: 4, height: 50, color: primaryColor });
    page.drawRectangle({ x: margin + 4, y: y - 50, width: contentWidth - 4, height: 50, color: rgb(0.98, 0.99, 1) });
    drawText("NOTES", margin + 12, y - 10, { font: fontBold, size: 8, color: grayColor });
    const noteLines = wrapText(data.notes, fontRegular, 9, contentWidth - 20);
    let ny = y - 24;
    for (const line of noteLines.slice(0, 3)) {
      drawText(line, margin + 12, ny, { size: 9, color: rgb(0.22, 0.26, 0.31) });
      ny -= 12;
    }
  }

  // ── Footer
  const footerY = 30;
  page.drawLine({
    start: { x: margin, y: footerY + 14 },
    end: { x: width - margin, y: footerY + 14 },
    thickness: 0.3,
    color: rgb(0.9, 0.91, 0.92),
  });
  drawText("Generated by FreelancePro", margin, footerY, { size: 8, color: rgb(0.61, 0.64, 0.69) });
  const invFooter = `Invoice #${data.number}`;
  const ifW = fontRegular.widthOfTextAtSize(invFooter, 8);
  drawText(invFooter, width - margin - ifW, footerY, { size: 8, color: rgb(0.61, 0.64, 0.69) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
