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
});
