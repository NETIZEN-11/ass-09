import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/User.js';
import Visitor from '../models/Visitor.js';
import Appointment from '../models/Appointment.js';
import Pass from '../models/Pass.js';
import CheckLog from '../models/CheckLog.js';
import generatePassId from '../utils/generatePassId.js';
import { generateQRCode } from '../services/qrService.js';
import { addDays, subDays } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const ORG_ID = process.env.DEFAULT_ORG_ID || 'demo-org-001';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Visitor.deleteMany({});
    await Appointment.deleteMany({});
    await Pass.deleteMany({});
    await CheckLog.deleteMany({});
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Seed users
const seedUsers = async () => {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@visitorpass.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      phone: '+1234567890',
      organizationId: ORG_ID,
      isActive: true,
    },
    {
      name: 'Security Guard 1',
      email: 'security1@visitorpass.com',
      password: 'security123',
      role: 'security',
      department: 'Security',
      phone: '+1234567891',
      organizationId: ORG_ID,
      isActive: true,
    },
    {
      name: 'Security Guard 2',
      email: 'security2@visitorpass.com',
      password: 'security123',
      role: 'security',
      department: 'Security',
      phone: '+1234567892',
      organizationId: ORG_ID,
      isActive: true,
    },
    {
      name: 'John Smith',
      email: 'john.smith@visitorpass.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      phone: '+1234567893',
      organizationId: ORG_ID,
      isActive: true,
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@visitorpass.com',
      password: 'employee123',
      role: 'employee',
      department: 'Human Resources',
      phone: '+1234567894',
      organizationId: ORG_ID,
      isActive: true,
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@visitorpass.com',
      password: 'employee123',
      role: 'employee',
      department: 'Marketing',
      phone: '+1234567895',
      organizationId: ORG_ID,
      isActive: true,
    },
  ];

  const createdUsers = await User.create(users);
  console.log('✅ Seeded users');
  return createdUsers;
};

// Seed visitors
const seedVisitors = async () => {
  const visitors = [
    {
      fullName: 'Robert Wilson',
      email: 'robert.wilson@example.com',
      phone: '+1234567900',
      company: 'Tech Solutions Inc',
      purpose: 'Business meeting',
      identityType: 'Driving License',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Emma Davis',
      email: 'emma.davis@example.com',
      phone: '+1234567901',
      company: 'Marketing Pro',
      purpose: 'Vendor meeting',
      identityType: 'Aadhar Card',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'James Brown',
      email: 'james.brown@example.com',
      phone: '+1234567902',
      company: 'ABC Corporation',
      purpose: 'Interview',
      identityType: 'Passport',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Olivia Martinez',
      email: 'olivia.martinez@example.com',
      phone: '+1234567903',
      company: 'Consulting Group',
      purpose: 'Consultation',
      identityType: 'PAN Card',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'William Anderson',
      email: 'william.anderson@example.com',
      phone: '+1234567904',
      company: 'Freelancer',
      purpose: 'Client meeting',
      identityType: 'Voter ID',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Sophia Taylor',
      email: 'sophia.taylor@example.com',
      phone: '+1234567905',
      company: 'Design Studio',
      purpose: 'Project discussion',
      identityType: 'Aadhar Card',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'David Miller',
      email: 'david.miller@example.com',
      phone: '+1234567906',
      company: 'Software Labs',
      purpose: 'Technical meeting',
      identityType: 'Driving License',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Isabella Garcia',
      email: 'isabella.garcia@example.com',
      phone: '+1234567907',
      company: 'HR Solutions',
      purpose: 'Recruitment',
      identityType: 'Passport',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Ethan Rodriguez',
      email: 'ethan.rodriguez@example.com',
      phone: '+1234567908',
      company: 'Sales Corp',
      purpose: 'Sales pitch',
      identityType: 'PAN Card',
      organizationId: ORG_ID,
      visitCount: 0,
    },
    {
      fullName: 'Mia Hernandez',
      email: 'mia.hernandez@example.com',
      phone: '+1234567909',
      company: 'Finance Group',
      purpose: 'Financial audit',
      identityType: 'Aadhar Card',
      organizationId: ORG_ID,
      visitCount: 0,
    },
  ];

  const createdVisitors = await Visitor.create(visitors);
  console.log('✅ Seeded visitors');
  return createdVisitors;
};

// Seed appointments
const seedAppointments = async (visitors, employees) => {
  const today = new Date();
  const appointments = [
    {
      visitorId: visitors[0]._id,
      hostId: employees[0]._id, // John Smith - Engineering
      department: 'Engineering',
      visitDate: today,
      arrivalTime: '10:00 AM',
      purpose: 'Discuss new project requirements',
      status: 'approved',
      approvalDate: subDays(today, 1),
      approvedBy: employees[0]._id,
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[1]._id,
      hostId: employees[1]._id, // Sarah Johnson - HR
      department: 'Human Resources',
      visitDate: today,
      arrivalTime: '11:30 AM',
      purpose: 'Vendor presentation',
      status: 'approved',
      approvalDate: subDays(today, 1),
      approvedBy: employees[1]._id,
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[2]._id,
      hostId: employees[1]._id, // Sarah Johnson - HR
      department: 'Human Resources',
      visitDate: today,
      arrivalTime: '02:00 PM',
      purpose: 'Job interview for Software Engineer position',
      status: 'approved',
      approvalDate: subDays(today, 1),
      approvedBy: employees[1]._id,
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[3]._id,
      hostId: employees[2]._id, // Michael Chen - Marketing
      department: 'Marketing',
      visitDate: addDays(today, 1),
      arrivalTime: '09:00 AM',
      purpose: 'Marketing campaign consultation',
      status: 'pending',
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[4]._id,
      hostId: employees[0]._id, // John Smith - Engineering
      department: 'Engineering',
      visitDate: addDays(today, 2),
      arrivalTime: '03:00 PM',
      purpose: 'Client project review meeting',
      status: 'pending',
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[5]._id,
      hostId: employees[2]._id, // Michael Chen - Marketing
      department: 'Marketing',
      visitDate: subDays(today, 2),
      arrivalTime: '01:00 PM',
      purpose: 'Design consultation',
      status: 'completed',
      approvalDate: subDays(today, 3),
      approvedBy: employees[2]._id,
      organizationId: ORG_ID,
    },
    {
      visitorId: visitors[6]._id,
      hostId: employees[0]._id, // John Smith - Engineering
      department: 'Engineering',
      visitDate: addDays(today, 1),
      arrivalTime: '11:00 AM',
      purpose: 'Technical architecture discussion',
      status: 'approved',
      approvalDate: today,
      approvedBy: employees[0]._id,
      organizationId: ORG_ID,
    },
  ];

  const createdAppointments = await Appointment.create(appointments);
  console.log('✅ Seeded appointments');
  return createdAppointments;
};

// Seed passes
const seedPasses = async (appointments, visitors) => {
  const passes = [];
  
  // Create passes for approved appointments
  for (const appointment of appointments) {
    if (appointment.status === 'approved' || appointment.status === 'completed') {
      const passId = generatePassId();
      const qrData = JSON.stringify({
        passId,
        visitorId: appointment.visitorId,
        appointmentId: appointment._id,
      });
      const qrCode = await generateQRCode(qrData);
      
      const validFrom = new Date(appointment.visitDate);
      validFrom.setHours(0, 0, 0, 0);
      const validUntil = new Date(appointment.visitDate);
      validUntil.setHours(23, 59, 59, 999);
      
      passes.push({
        passId,
        visitorId: appointment.visitorId,
        appointmentId: appointment._id,
        qrCode,
        validFrom,
        validUntil,
        status: appointment.status === 'completed' ? 'used' : 'active',
        organizationId: ORG_ID,
        generatedBy: appointment.approvedBy,
      });
    }
  }

  const createdPasses = await Pass.create(passes);
  console.log('✅ Seeded passes');
  return createdPasses;
};

// Seed check logs
const seedCheckLogs = async (passes, security) => {
  const logs = [];
  const today = new Date();
  
  // Create check-in logs for some passes
  for (let i = 0; i < Math.min(passes.length, 3); i++) {
    const pass = passes[i];
    if (pass.status === 'used') {
      const checkInTime = new Date(pass.validFrom);
      checkInTime.setHours(9 + i, 30, 0, 0);
      
      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(checkInTime.getHours() + 2);
      
      logs.push({
        visitorId: pass.visitorId,
        passId: pass._id,
        securityUserId: security[i % security.length]._id,
        checkInTime,
        checkOutTime,
        entryStatus: 'checked-out',
        organizationId: ORG_ID,
      });
    }
  }

  if (logs.length > 0) {
    await CheckLog.create(logs);
    console.log('✅ Seeded check logs');
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearData();
    
    const users = await seedUsers();
    const admin = users.filter(u => u.role === 'admin');
    const security = users.filter(u => u.role === 'security');
    const employees = users.filter(u => u.role === 'employee');
    
    const visitors = await seedVisitors();
    const appointments = await seedAppointments(visitors, employees);
    const passes = await seedPasses(appointments, visitors);
    await seedCheckLogs(passes, security);
    
    console.log('\n📊 SEED SUMMARY:');
    console.log('================');
    console.log(`👥 Users: ${users.length}`);
    console.log(`   - Admins: ${admin.length}`);
    console.log(`   - Security: ${security.length}`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`👤 Visitors: ${visitors.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(`🎫 Passes: ${passes.length}`);
    
    console.log('\n🔑 DEMO LOGIN CREDENTIALS:');
    console.log('==========================');
    console.log('Admin:');
    console.log('  Email: admin@visitorpass.com');
    console.log('  Password: admin123');
    console.log('\nSecurity:');
    console.log('  Email: security1@visitorpass.com');
    console.log('  Password: security123');
    console.log('\nEmployee:');
    console.log('  Email: john.smith@visitorpass.com');
    console.log('  Password: employee123');
    
    console.log('\n✨ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
