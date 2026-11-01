import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateVisitorPassPDF = async (passData, visitor, appointment, host) => {
  return new Promise((resolve, reject) => {
    try {
      // Create passes directory if it doesn't exist
      const passesDir = path.join(__dirname, '../public/passes');
      if (!fs.existsSync(passesDir)) {
        fs.mkdirSync(passesDir, { recursive: true });
      }

      const filename = `pass-${passData.passId}.pdf`;
      const filepath = path.join(passesDir, filename);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header with branding
      doc.fontSize(28).fillColor('#1e40af').text('VisitorPass', { align: 'center' });
      doc.fontSize(12).fillColor('#6b7280').text('Smart Visitor Management', { align: 'center' });
      doc.moveDown(2);

      // Pass ID Banner
      doc.rect(50, doc.y, 495, 40).fillAndStroke('#1e40af', '#1e40af');
      doc.fontSize(16).fillColor('#ffffff').text(`Pass ID: ${passData.passId}`, 50, doc.y - 27, {
        width: 495,
        align: 'center',
      });
      doc.moveDown(3);

      // Visitor Photo placeholder (if available)
      const photoY = doc.y;
      doc.fontSize(12).fillColor('#000000');
      
      if (visitor.photograph) {
        try {
          const photoPath = path.join(__dirname, '../', visitor.photograph);
          if (fs.existsSync(photoPath)) {
            doc.image(photoPath, 50, photoY, { width: 100, height: 100 });
          }
        } catch (err) {
          console.log('Photo not added to PDF');
        }
      }

      // Visitor Details
      const detailsX = 170;
      doc.fontSize(14).fillColor('#1e40af').text('VISITOR DETAILS', detailsX, photoY);
      doc.fontSize(11).fillColor('#000000');
      doc.moveDown(0.5);
      doc.text(`Name: ${visitor.fullName}`, detailsX);
      doc.text(`Email: ${visitor.email}`, detailsX);
      doc.text(`Phone: ${visitor.phone}`, detailsX);
      if (visitor.company) {
        doc.text(`Company: ${visitor.company}`, detailsX);
      }

      doc.moveDown(2);

      // Appointment Details
      doc.fontSize(14).fillColor('#1e40af').text('APPOINTMENT DETAILS');
      doc.fontSize(11).fillColor('#000000');
      doc.moveDown(0.5);
      doc.text(`Host: ${host.name}`);
      doc.text(`Department: ${appointment.department}`);
      doc.text(`Purpose: ${appointment.purpose}`);
      doc.text(`Visit Date: ${new Date(appointment.visitDate).toLocaleDateString()}`);
      doc.text(`Time: ${appointment.arrivalTime}`);

      doc.moveDown(2);

      // Pass Validity
      doc.fontSize(14).fillColor('#1e40af').text('PASS VALIDITY');
      doc.fontSize(11).fillColor('#000000');
      doc.moveDown(0.5);
      doc.text(`Valid From: ${new Date(passData.validFrom).toLocaleString()}`);
      doc.text(`Valid Until: ${new Date(passData.validUntil).toLocaleString()}`);
      doc.text(`Status: ${passData.status.toUpperCase()}`, { continued: false });

      doc.moveDown(2);

      // QR Code
      doc.fontSize(14).fillColor('#1e40af').text('QR CODE FOR CHECK-IN');
      doc.moveDown(0.5);
      
      // Add QR code image from base64
      if (passData.qrCode) {
        const qrImage = passData.qrCode.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(qrImage, 'base64');
        doc.image(qrBuffer, { width: 200, height: 200 });
      }

      doc.moveDown(2);

      // Instructions
      doc.fontSize(10).fillColor('#6b7280');
      doc.text('Please present this pass at the security desk for verification.', { align: 'center' });
      doc.text('This pass is valid only for the specified date and time.', { align: 'center' });

      // Footer
      doc.moveDown(3);
      doc.fontSize(8).fillColor('#9ca3af');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.text('VisitorPass © 2026 - Smart Visitor Management System', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/passes/${filename}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
