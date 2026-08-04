const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

const STUDENT_USER = {
    name: 'Pending Student',
    email: 'pending_student_' + Date.now() + '@example.com',
    password: 'password123',
    role: 'student',
    roll_number: '54321',
    registration_number: 'REG999',
    department: 'CSE'
};

const TEACHER_USER = {
    name: 'Test Teacher',
    email: 'test_teacher_' + Date.now() + '@example.com',
    password: 'password123',
    role: 'teacher'
};

async function runTests() {
    try {
        await connectDB();

        console.log('--- Test 1: Register Teacher & Get Token ---');
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEACHER_USER)
        });

        const teacherLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEACHER_USER.email,
                password: TEACHER_USER.password,
                role: 'teacher'
            })
        });
        const teacherLoginData = await teacherLoginRes.json();
        const teacherToken = teacherLoginData.token;

        if (teacherToken) {
            console.log('✅ Teacher registered and logged in');
        } else {
            throw new Error('❌ Teacher failed to login');
        }

        console.log('\n--- Test 2: Register Pending Student ---');
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(STUDENT_USER)
        });

        // Grab student ID from DB directly so we can test the PUT route
        const studentRecord = await User.findOne({ email: STUDENT_USER.email });
        if (studentRecord && studentRecord.status === 'pending') {
            console.log('✅ Pending student created successfully');
        } else {
            throw new Error('❌ Student not pending or not created');
        }

        console.log('\n--- Test 3: Teacher Fetches Pending Students ---');
        const pendingRes = await fetch(`${API_URL}/admin/pending-students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const pendingData = await pendingRes.json();

        if (pendingRes.status === 200 && pendingData.data.students.length > 0) {
            console.log(`✅ Teacher fetched ${pendingData.data.students.length} pending students`);

            // Ensure our newly created student is in the list
            const found = pendingData.data.students.find(s => s._id.toString() === studentRecord._id.toString());
            if (!found) throw new Error('❌ Created student not found in pending list');
        } else {
            throw new Error(`❌ Failed to fetch pending students. Response: ${JSON.stringify(pendingData)}`);
        }

        console.log('\n--- Test 4: Student Attempts to Fetch Pending Students (Should Fail) ---');

        // Manually approve student so we can get their login token directly for this test
        await User.findByIdAndUpdate(studentRecord._id, { status: 'approved', approved: true });

        const studentLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: STUDENT_USER.email,
                password: STUDENT_USER.password,
                role: 'student'
            })
        });
        const studentToken = (await studentLoginRes.json()).token;

        // Now revert the student back to pending for the next test
        await User.findByIdAndUpdate(studentRecord._id, { status: 'pending', approved: false });

        const invalidPendingRes = await fetch(`${API_URL}/admin/pending-students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            }
        });

        if (invalidPendingRes.status === 403) {
            console.log('✅ Student correctly blocked from admin route');
        } else {
            throw new Error(`❌ Student was able to access admin route! Status: ${invalidPendingRes.status}`);
        }

        console.log('\n--- Test 5: Teacher Approves Pending Student ---');
        const approveRes = await fetch(`${API_URL}/admin/approve-student/${studentRecord._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const approveData = await approveRes.json();

        if (approveRes.status === 200 && approveData.data.student.status === 'approved') {
            console.log('✅ Teacher successfully approved student');
        } else {
            throw new Error(`❌ Failed to approve student. Response: ${JSON.stringify(approveData)}`);
        }

    } catch (error) {
        console.error('\nTest script failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('\nTests completed.');
    }
}

runTests();
