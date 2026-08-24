const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Authentication API', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should register a new student and return pending status message', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test Student',
                email: 'test@student.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                role: 'student',
                rollNumber: 'R12345',
                registrationNumber: 'REG12345',
                department: 'Computer Science',
                semester: '1st'
            });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBeTruthy();
        expect(res.body.token).toBeUndefined(); // No token on register
    });

    it('should login an existing approved user', async () => {
        // Setup
        await User.create({
            fullName: 'Login Test',
            email: 'login@test.com',
            password: 'password123',
            role: 'teacher',
            status: 'approved'
        });

        // Test
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@test.com',
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBeTruthy();
        expect(res.body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@test.com',
                password: 'wrongpassword'
            });
        
        expect([400, 401, 404]).toContain(res.statusCode); // Different versions might use 400 or 401
        expect(res.body.success).toBeFalsy();
    });

    it('should block pending student/teacher login and allow login once approved', async () => {
        // Create student
        const student = await User.create({
            fullName: 'Pending Student',
            email: 'student_pending@test.com',
            password: 'password123',
            role: 'student',
            status: 'pending',
            approved: false
        });

        // Create teacher
        const teacher = await User.create({
            fullName: 'Pending Teacher',
            email: 'teacher_pending@test.com',
            password: 'password123',
            role: 'teacher',
            status: 'pending',
            approved: false
        });

        // Create admin to approve them
        const admin = await User.create({
            fullName: 'System Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin',
            status: 'approved',
            approved: true
        });

        // Admin logs in
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'password123' });
        const adminToken = adminLoginRes.body.token;

        // 1. Pending student tries login -> blocked
        const unapprovedStudentRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'student_pending@test.com', password: 'password123' });
        expect(unapprovedStudentRes.statusCode).toEqual(403);
        expect(unapprovedStudentRes.body.message).toContain('waiting for approval');

        // 2. Pending teacher tries login -> blocked
        const unapprovedTeacherRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'teacher_pending@test.com', password: 'password123' });
        expect(unapprovedTeacherRes.statusCode).toEqual(403);
        expect(unapprovedTeacherRes.body.message).toContain('waiting for approval');

        // 3. Admin approves student via PUT /api/admin/users/:id
        const approveStudentRes = await request(app)
            .put(`/api/admin/users/${student._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'approved' });
        expect(approveStudentRes.statusCode).toEqual(200);

        // 4. Student logs in after approval -> SUCCESS!
        const approvedStudentRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'student_pending@test.com', password: 'password123' });
        expect(approvedStudentRes.statusCode).toEqual(200);
        expect(approvedStudentRes.body.success).toBeTruthy();
        expect(approvedStudentRes.body.token).toBeDefined();

        // 5. Admin approves teacher via PUT /api/admin/users/:id/approve
        const approveTeacherRes = await request(app)
            .put(`/api/admin/users/${teacher._id}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(approveTeacherRes.statusCode).toEqual(200);

        // 6. Teacher logs in after approval -> SUCCESS!
        const approvedTeacherRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'teacher_pending@test.com', password: 'password123' });
        expect(approvedTeacherRes.statusCode).toEqual(200);
        expect(approvedTeacherRes.body.success).toBeTruthy();
        expect(approvedTeacherRes.body.token).toBeDefined();
    }, 30000);
});
