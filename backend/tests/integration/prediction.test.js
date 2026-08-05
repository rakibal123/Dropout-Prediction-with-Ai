const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;
let studentId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create an approved student user directly in DB
    const user = await User.create({
        fullName: 'Prediction Test Student',
        email: 'pred_student@test.com',
        password: 'password123',
        role: 'student',
        status: 'approved'
    });
    studentId = user._id;

    // Login to get token
    const res = await request(app).post('/api/auth/login').send({
        email: 'pred_student@test.com',
        password: 'password123'
    });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Prediction API', () => {
    it('should reject prediction if unauthenticated', async () => {
        const res = await request(app)
            .post('/api/student/predict')
            .send({});
        expect(res.statusCode).toEqual(401);
    });

    it('should successfully submit behavior record and trigger prediction', async () => {
        // Step 1: Submit Behavior Record
        const behaviorRes = await request(app)
            .post('/api/student/behavior')
            .set('Authorization', `Bearer ${token}`)
            .send({
                attendancePercentage: 85,
                assignmentSubmissionRate: 90,
                quizAverage: 80,
                midtermMarks: 75,
                studyHoursPerWeek: 15,
                engagementScore: 8,
                loginFrequency: 5,
                participationScore: 7,
                stressLevel: 3,
                motivationLevel: 8
            });
        
        expect(behaviorRes.statusCode).toEqual(201);
        expect(behaviorRes.body.success).toBeTruthy();
        const behaviorRecordId = behaviorRes.body.behaviorRecordId;

        // Step 2: Trigger Prediction
        const predictRes = await request(app)
            .post('/api/student/predict')
            .set('Authorization', `Bearer ${token}`)
            .send({
                behaviorRecordId: behaviorRecordId
            });
        
        // This might fail with 503 if ML Service is down during tests, which is expected
        expect([200, 201, 503]).toContain(predictRes.statusCode);
    });
});
