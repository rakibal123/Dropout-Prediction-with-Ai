require('dotenv').config();
const mongoose = require('mongoose');
const Semester = require('./src/models/Semester');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    // Clear old semesters
    await Semester.deleteMany({});
    
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
        semesters.push({
            name: `Semester ${i}`,
            number: i,
            academicYear: '2024-2025',
            isActive: true
        });
    }
    
    await Semester.insertMany(semesters);
    console.log('Inserted 8 Semesters');
    process.exit(0);
}

seed();
