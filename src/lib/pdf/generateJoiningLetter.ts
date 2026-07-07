import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JoiningLetterData {
  staffName: string;
  role: string;
  zone: string;
  joiningDate: string;
  salary: number;
  terms: string[];
}

export function generateJoiningLetter(data: JoiningLetterData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('KRIXIFY OPERATIONS', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Letter of Joining', 105, 30, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const intro = `This is to confirm that ${data.staffName} has been appointed as ${data.role} for the zone "${data.zone}", effective from ${data.joiningDate}.`;
  doc.text(doc.splitTextToSize(intro, 170), 20, 50);

  doc.text('Terms & Conditions:', 20, 75);
  autoTable(doc, {
    startY: 80,
    head: [['#', 'Clause']],
    body: data.terms.map((t, i) => [String(i + 1), t]),
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Compensation: ₹${data.salary.toLocaleString('en-IN')} per month`, 20, finalY);
  doc.text('Authorized Signatory', 20, finalY + 25);
  doc.text('Krixify Operations', 20, finalY + 32);

  return doc.save(`joining-letter-${data.staffName.replace(/\s+/g, '-')}.pdf`);
}
