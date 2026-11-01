import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send appointment approval email
export const sendApprovalEmail = async (visitorEmail, visitorName, hostName, visitDate) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: visitorEmail,
      subject: 'Appointment Approved - VisitorPass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Appointment Approved</h2>
          <p>Dear ${visitorName},</p>
          <p>Your appointment request has been approved.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Host:</strong> ${hostName}</p>
            <p><strong>Visit Date:</strong> ${new Date(visitDate).toLocaleDateString()}</p>
          </div>
          <p>Your visitor pass has been generated. Please check your visitor portal for the QR code and pass details.</p>
          <p>Best regards,<br/>VisitorPass Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent to:', visitorEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

// Send appointment rejection email
export const sendRejectionEmail = async (visitorEmail, visitorName, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: visitorEmail,
      subject: 'Appointment Update - VisitorPass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Update</h2>
          <p>Dear ${visitorName},</p>
          <p>We regret to inform you that your appointment request has been declined.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please contact the host directly for more information or to reschedule.</p>
          <p>Best regards,<br/>VisitorPass Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to:', visitorEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

// Send visitor arrival notification to host
export const sendArrivalNotification = async (hostEmail, hostName, visitorName, checkInTime) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: hostEmail,
      subject: 'Visitor Arrived - VisitorPass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Visitor Arrival Notification</h2>
          <p>Dear ${hostName},</p>
          <p>Your visitor <strong>${visitorName}</strong> has checked in.</p>
          <p><strong>Check-in Time:</strong> ${new Date(checkInTime).toLocaleString()}</p>
          <p>Best regards,<br/>VisitorPass Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Arrival notification sent to:', hostEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

// Send pass generation email
export const sendPassGeneratedEmail = async (visitorEmail, visitorName, passId) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: visitorEmail,
      subject: 'Your Visitor Pass is Ready - VisitorPass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Visitor Pass Generated</h2>
          <p>Dear ${visitorName},</p>
          <p>Your visitor pass has been successfully generated.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Pass ID:</strong> ${passId}</p>
          </div>
          <p>Please login to your visitor portal to view and download your pass.</p>
          <p>Best regards,<br/>VisitorPass Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Pass generated email sent to:', visitorEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};
