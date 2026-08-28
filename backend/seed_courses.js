require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Semester = require('./src/models/Semester');
const User = require('./src/models/User');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const semesters = await Semester.find().sort({ number: 1 });
    
    await Course.deleteMany({});
    
    const courses = [];
    
    for (let i = 0; i < semesters.length; i++) {
        const sem = semesters[i];
        const semNumber = sem.number;
        
        courses.push({
            code: `CSE${semNumber}01`,
            title: `Theory Course ${semNumber}.1`,
            credit: 3,
            type: 'Theory',
            department: 'CSE',
            semesterId: sem._id
        });
        
        courses.push({
            code: `CSE${semNumber}02`,
            title: `Lab Course ${semNumber}.1`,
            credit: 1.5,
            type: 'Laboratory',
            department: 'CSE',
            semesterId: sem._id
        });
    }
    
    await Course.insertMany(courses);
    console.log(`Seeded ${courses.length} courses across ${semesters.length} semesters.`);
    process.exit(0);
}

seed();
