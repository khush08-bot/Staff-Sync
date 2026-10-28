const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const Announcement = require('../src/models/Announcement');
const Training = require('../src/models/Training');

const seedData = async () => {
  console.log('[StaffSync Seed] Starting database seeding process...');

  try {
    await connectDB();

    // Verify database connection before proceeding
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database is not connected.');
    }

    // Check if seeding is running in production with existing users
    const userCount = await User.countDocuments();
    const forceFlag = process.argv.includes('--force');

    if (userCount > 0 && !forceFlag) {
      console.log(`[StaffSync Seed] Database already contains ${userCount} users.`);
      console.log('[StaffSync Seed] Safe seed mode: Updating/upserting demo accounts without dropping collections.');
    }

    // If --force is passed, clear collections explicitly
    if (forceFlag) {
      console.log('[StaffSync Seed] --force flag detected. Clearing existing demo collections...');
      await User.deleteMany({});
      await Employee.deleteMany({});
      await Attendance.deleteMany({});
      await Leave.deleteMany({});
      await Announcement.deleteMany({});
      await Training.deleteMany({});
    }

    const defaultPassword = 'Password123!';

    // 1. Create or Find HR User
    let hrUser = await User.findOne({ email: 'hr@staffsync.com' });
    if (!hrUser) {
      hrUser = await User.create({
        name: 'Eleanor Vance',
        email: 'hr@staffsync.com',
        password: defaultPassword,
        role: 'hr',
      });
      console.log('✓ Created HR User: hr@staffsync.com');
    }

    let hrEmployee = await Employee.findOne({ user: hrUser._id });
    if (!hrEmployee) {
      hrEmployee = await Employee.create({
        user: hrUser._id,
        employeeId: 'EMP-001',
        firstName: 'Eleanor',
        lastName: 'Vance',
        email: 'hr@staffsync.com',
        phone: '+1 (555) 234-5670',
        department: 'Human Resources',
        designation: 'Chief HR Officer',
        role: 'hr',
        status: 'Active',
        address: '100 Enterprise Way, Suite 400',
      });
    }

    // 2. Create or Find Manager User
    let mgrUser = await User.findOne({ email: 'manager@staffsync.com' });
    if (!mgrUser) {
      mgrUser = await User.create({
        name: 'Marcus Sterling',
        email: 'manager@staffsync.com',
        password: defaultPassword,
        role: 'manager',
      });
      console.log('✓ Created Manager User: manager@staffsync.com');
    }

    let mgrEmployee = await Employee.findOne({ user: mgrUser._id });
    if (!mgrEmployee) {
      mgrEmployee = await Employee.create({
        user: mgrUser._id,
        employeeId: 'EMP-002',
        firstName: 'Marcus',
        lastName: 'Sterling',
        email: 'manager@staffsync.com',
        phone: '+1 (555) 234-5671',
        department: 'Engineering',
        designation: 'Engineering Manager',
        role: 'manager',
        status: 'Active',
        address: '100 Enterprise Way, Suite 210',
      });
    }

    // 3. Create or Find Primary Employee User
    let empUser = await User.findOne({ email: 'employee@staffsync.com' });
    if (!empUser) {
      empUser = await User.create({
        name: 'Alex Rivera',
        email: 'employee@staffsync.com',
        password: defaultPassword,
        role: 'employee',
      });
      console.log('✓ Created Employee User: employee@staffsync.com');
    }

    let empEmployee = await Employee.findOne({ user: empUser._id });
    if (!empEmployee) {
      empEmployee = await Employee.create({
        user: empUser._id,
        employeeId: 'EMP-003',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'employee@staffsync.com',
        phone: '+1 (555) 234-5672',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        role: 'employee',
        manager: mgrUser._id, // Reports to Marcus Sterling
        status: 'Active',
        address: '42 Greenway Blvd, Apt 4B',
      });
    }

    // 4. Create Additional Team Employee (for Manager team overview)
    let teamMemberUser = await User.findOne({ email: 'sarah.design@staffsync.com' });
    let teamMemberEmployee;
    if (!teamMemberUser) {
      teamMemberUser = await User.create({
        name: 'Sarah Chen',
        email: 'sarah.design@staffsync.com',
        password: defaultPassword,
        role: 'employee',
      });

      teamMemberEmployee = await Employee.create({
        user: teamMemberUser._id,
        employeeId: 'EMP-004',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.design@staffsync.com',
        phone: '+1 (555) 234-5673',
        department: 'Engineering',
        designation: 'Product Designer',
        role: 'employee',
        manager: mgrUser._id, // Reports to Marcus Sterling
        status: 'Active',
        address: '88 Innovation Ave',
      });
      console.log('✓ Created Team Member: sarah.design@staffsync.com');
    } else {
      teamMemberEmployee = await Employee.findOne({ user: teamMemberUser._id });
    }

    // 5. Seed Announcements
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
        {
          title: 'Welcome to StaffSync Modern HR Platform',
          message:
            'We are thrilled to roll out StaffSync across all organizational departments. Please review your profiles and explore the attendance and leave tracking features.',
          priority: 'High',
          targetAudience: 'All',
          author: hrUser._id,
          authorName: hrUser.name,
        },
        {
          title: 'Upcoming Annual Company Offsite & Retreat',
          message:
            'Mark your calendars! The annual organizational retreat will take place next month. Stay tuned for registration details and breakout session agendas.',
          priority: 'Medium',
          targetAudience: 'All',
          author: hrUser._id,
          authorName: hrUser.name,
        },
        {
          title: 'Quarterly Manager Performance & OKR Calibration',
          message:
            'All team managers are requested to submit Q3 team performance reviews and upcoming growth objectives by the end of next week.',
          priority: 'Urgent',
          targetAudience: 'manager',
          author: hrUser._id,
          authorName: hrUser.name,
        },
      ]);
      console.log('✓ Seeded initial announcements');
    }

    // 6. Seed Training Programs
    const trainingCount = await Training.countDocuments();
    if (trainingCount === 0) {
      const today = new Date();
      const inOneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const inTwoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

      await Training.create([
        {
          title: 'Modern Full-Stack Cloud Architecture & Security',
          description:
            'Hands-on workshop covering REST APIs, JWT authentication best practices, database indexing, and cloud container deployment.',
          instructor: 'Dr. Evelyn Reed',
          department: 'Engineering',
          startDate: inOneWeek,
          endDate: inTwoWeeks,
          status: 'Upcoming',
          assignedEmployees: [empEmployee._id, teamMemberEmployee ? teamMemberEmployee._id : empEmployee._id],
          createdBy: mgrUser._id,
        },
        {
          title: 'Workplace Wellness & Ergonomics Seminar',
          description:
            'Practical strategies for maintaining physical wellbeing, ergonomic workspace setup, and productive time management.',
          instructor: 'Wellness Council',
          department: 'General',
          startDate: today,
          endDate: inOneWeek,
          status: 'In Progress',
          assignedEmployees: [empEmployee._id],
          createdBy: mgrUser._id,
        },
      ]);
      console.log('✓ Seeded training programs');
    }

    // 7. Seed Sample Leaves
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      const nextWeekStart = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const nextWeekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await Leave.create([
        {
          employee: empEmployee._id,
          user: empUser._id,
          leaveType: 'Annual Leave',
          startDate: nextWeekStart,
          endDate: nextWeekEnd,
          days: 3,
          reason: 'Family visit and personal recreation trip.',
          status: 'Pending',
        },
        {
          employee: teamMemberEmployee ? teamMemberEmployee._id : empEmployee._id,
          user: teamMemberUser ? teamMemberUser._id : empUser._id,
          leaveType: 'Sick Leave',
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          days: 2,
          reason: 'Seasonal viral fever recovery.',
          status: 'Approved',
          reviewedBy: mgrUser._id,
          reviewerName: mgrUser.name,
          reviewRemarks: 'Approved. Take proper rest and feel better!',
          reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ]);
      console.log('✓ Seeded sample leave records');
    }

    // 8. Seed Sample Today's Attendance
    const todayStr = new Date().toISOString().split('T')[0];
    const existingAttendance = await Attendance.findOne({
      employee: empEmployee._id,
      date: todayStr,
    });

    if (!existingAttendance) {
      const checkInTime = new Date();
      checkInTime.setHours(9, 15, 0, 0);

      await Attendance.create({
        employee: empEmployee._id,
        user: empUser._id,
        date: todayStr,
        checkIn: checkInTime,
        status: 'Present',
        notes: 'Regular on-time check-in',
      });
      console.log('✓ Seeded sample today check-in for Alex Rivera');
    }

    console.log('\n=============================================');
    console.log('✅ StaffSync Database Seeding Completed!');
    console.log('=============================================');
    console.log('Demo Login Credentials:');
    console.log('---------------------------------------------');
    console.log('1. HR Account:');
    console.log('   Email:    hr@staffsync.com');
    console.log('   Password: Password123!');
    console.log('   Role:     HR (Full organization management)');
    console.log('---------------------------------------------');
    console.log('2. Manager Account:');
    console.log('   Email:    manager@staffsync.com');
    console.log('   Password: Password123!');
    console.log('   Role:     Manager (Team leaves & training management)');
    console.log('---------------------------------------------');
    console.log('3. Employee Account:');
    console.log('   Email:    employee@staffsync.com');
    console.log('   Password: Password123!');
    console.log('   Role:     Employee (Self attendance, leaves, training)');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[StaffSync Seed] Error seeding database: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
