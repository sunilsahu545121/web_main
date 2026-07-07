import jsPDF from 'jspdf';

interface IdCardData {
  name: string;
  role: string;
  id: string;
  phone: string;
  zone: string;
  validUntil: string;
  photoDataUrl?: string;
}

export function generateIdCard(data: IdCardData) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
  // Card ID 1 - Front
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 85.6, 53.98, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KRIXIFY', 5, 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(data.role.toUpperCase(), 5, 13);

  if (data.photoDataUrl) doc.addImage(data.photoDataUrl, 'JPEG', 5, 18, 22, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.name, 30, 25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${data.id.slice(0, 12)}`, 30, 32);
  doc.text(`Zone: ${data.zone}`, 30, 38);
  doc.text(`Valid: ${data.validUntil}`, 30, 44);

  return doc.save(`id-card-${data.id.slice(0, 8)}.pdf`);
}
