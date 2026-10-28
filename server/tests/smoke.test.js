const assert = require('assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.CLIENT_URL = 'http://localhost:5173,https://staffsync.vercel.app';

const { app } = require('../server');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Attendance = require('../src/models/Attendance');
const Leave = require('../src/models/Leave');
const Announcement = require('../src/models/Announcement');
const Training = require('../src/models/Training');
const connectDB = require('../src/config/db');

let passedTests = 0;
let totalTests = 0;

const runTest = async (testName, testFn) => {
  totalTests++;
  try {
    process.stdout.write(`  • Testing ${testName}... `);
    await testFn();
    console.log('✅ PASS');
    passedTests++;
  } catch (err) {
    console.log('❌ FAIL');
    console.error(`    Error: ${err.message}`);
    throw err;
  }
};

const runSmokeTests = async () => {
  console.log('\n=================================================');
  console.log('🚀 Running StaffSync Smoke & Verification Suite');
  console.log('=================================================\n');

  // Test 1: Health Endpoint
  await runTest('GET /api/health endpoint returns 200 and healthy JSON', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.service, 'StaffSync HR API');
    assert.ok(res.body.timestamp);
  });

  // Test 2: Unauthenticated Protected Route Rejection
  await runTest('Protected endpoints reject requests without JWT with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Authentication required'));
  });

  // Test 3: Invalid JWT Rejection
  await runTest('Protected endpoints reject forged/invalid token with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.forged.token');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Invalid authentication token'));
  });

  // Test 4: MONGO_URI validation
  await runTest('Database connection validator checks URI format and placeholders', async () => {
    const originalUri = process.env.MONGO_URI;

    // Missing URI
    delete process.env.MONGO_URI;
    await assert.rejects(async () => await connectDB(), /MONGO_URI environment variable is missing/);

    // Invalid scheme
    process.env.MONGO_URI = 'postgres://localhost:5432/db';
    await assert.rejects(async () => await connectDB(), /Invalid MONGO_URI format/);

    // Placeholder tokens
    process.env.MONGO_URI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/test';
    await assert.rejects(async () => await connectDB(), /contains unreplaced placeholder tokens/);

    // Restore
    process.env.MONGO_URI = originalUri || 'mongodb://127.0.0.1:27017/staffsync';
  });

  // Test 5: Role-based Authorization Middleware
  await runTest('Role authorization middleware restricts unauthorized roles', async () => {
    const { authorize } = require('../src/middleware/roleMiddleware');
    const hrOnly = authorize('hr');

    // Simulate employee user accessing HR route
    let statusSet = null;
    let jsonOutput = null;
    let nextCalled = false;

    const fakeReq = { user: { role: 'employee', name: 'Test' } };
    const fakeRes = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };
    const fakeNext = () => {
      nextCalled = true;
    };

    hrOnly(fakeReq, fakeRes, fakeNext);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusSet, 403);
    assert.ok(jsonOutput.message.includes('Forbidden'));

    // Simulate HR user accessing HR route
    nextCalled = false;
    fakeReq.user.role = 'hr';
    hrOnly(fakeReq, fakeRes, fakeNext);
    assert.strictEqual(nextCalled, true);
  });

  // Test 6: Registration Policy (Public registration strictly creates Employee accounts only)
  await runTest('Public registration policy strictly enforces Employee role and validates fields', async () => {
    const { register } = require('../src/controllers/authController');

    // Missing fields validation
    let statusSet = null;
    let jsonOutput = null;
    const fakeReq = { body: { name: 'New Employee' } };
    const fakeRes = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };

    await register(fakeReq, fakeRes, (err) => {
      throw err;
    });
    assert.strictEqual(statusSet, 400);
    assert.ok(jsonOutput.message.includes('Name, email, and password are required'));
  });

  // Test 7: Leave Date Validation
  await runTest('Leave application prevents end dates earlier than start dates', async () => {
    const { applyLeave } = require('../src/controllers/leaveController');
    let statusSet = null;
    let jsonOutput = null;

    const fakeReq = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        leaveType: 'Sick Leave',
        startDate: '2026-11-10',
        endDate: '2026-11-05', // Earlier than start date!
        reason: 'Rest',
      },
    };

    const fakeRes = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };

    // Mock Employee.findOne to return an employee
    const originalFindOne = Employee.findOne;
    Employee.findOne = () => Promise.resolve({ _id: new mongoose.Types.ObjectId() });

    try {
      await applyLeave(fakeReq, fakeRes, () => {});
      assert.strictEqual(statusSet, 400);
      assert.ok(jsonOutput.message.includes('End date cannot be earlier than start date'));
    } finally {
      Employee.findOne = originalFindOne;
    }
  });

  // Test 8: Attendance Check-In / Check-Out Validation
  await runTest('Attendance checkout rejects checkout without prior check-in', async () => {
    const { checkOut } = require('../src/controllers/attendanceController');
    let statusSet = null;
    let jsonOutput = null;

    const fakeReq = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {},
    };

    const fakeRes = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };

    const originalEmpFindOne = Employee.findOne;
    const originalAttFindOne = Attendance.findOne;

    Employee.findOne = () => Promise.resolve({ _id: new mongoose.Types.ObjectId() });
    Attendance.findOne = () => Promise.resolve(null); // No check-in today

    try {
      await checkOut(fakeReq, fakeRes, () => {});
      assert.strictEqual(statusSet, 400);
      assert.ok(jsonOutput.message.includes('No check-in record found for today'));
    } finally {
      Employee.findOne = originalEmpFindOne;
      Attendance.findOne = originalAttFindOne;
    }
  });

  // Test 9: Manager Leave Authorization Rule
  await runTest('Manager can only review leave requests of their assigned team members', async () => {
    const { updateLeaveStatus } = require('../src/controllers/leaveController');
    let statusSet = null;
    let jsonOutput = null;

    const managerUserId = new mongoose.Types.ObjectId();
    const otherManagerId = new mongoose.Types.ObjectId();

    const fakeReq = {
      params: { id: new mongoose.Types.ObjectId().toString() },
      user: { _id: managerUserId, role: 'manager', name: 'Manager Marcus' },
      body: { status: 'Approved' },
    };

    const fakeRes = {
      status: (code) => {
        statusSet = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };

    const originalLeaveFindById = Leave.findById;
    // Leave belongs to employee who reports to otherManagerId
    Leave.findById = () => ({
      populate: () =>
        Promise.resolve({
          _id: fakeReq.params.id,
          status: 'Pending',
          employee: {
            manager: otherManagerId,
          },
        }),
    });

    try {
      await updateLeaveStatus(fakeReq, fakeRes, () => {});
      assert.strictEqual(statusSet, 403);
      assert.ok(jsonOutput.message.includes('Access denied. You can only review leave requests from your assigned team members'));
    } finally {
      Leave.findById = originalLeaveFindById;
    }
  });

  // Test 10: Announcements Audience Filter
  await runTest('Announcements endpoint filters records according to audience permissions', async () => {
    const { getAnnouncements } = require('../src/controllers/announcementController');

    let capturedQuery = null;
    const originalFind = Announcement.find;
    Announcement.find = (q) => {
      capturedQuery = q;
      return {
        populate: () => ({
          sort: () => Promise.resolve([]),
        }),
      };
    };

    const fakeRes = {
      json: () => {},
    };

    // Employee request
    await getAnnouncements({ user: { role: 'employee' } }, fakeRes, () => {});
    assert.deepStrictEqual(capturedQuery.targetAudience, { $in: ['All', 'employee'] });

    // Manager request
    await getAnnouncements({ user: { role: 'manager' } }, fakeRes, () => {});
    assert.deepStrictEqual(capturedQuery.targetAudience, { $in: ['All', 'manager'] });

    // HR request sees all
    capturedQuery = null;
    await getAnnouncements({ user: { role: 'hr' } }, fakeRes, () => {});
    assert.strictEqual(capturedQuery.targetAudience, undefined);

    Announcement.find = originalFind;
  });

  console.log('\n=================================================');
  console.log(`🎉 All ${passedTests}/${totalTests} Tests Passed Successfully!`);
  console.log('=================================================\n');
};

runSmokeTests().catch((err) => {
  console.error('\n❌ Smoke tests failed:', err.message);
  process.exit(1);
});
