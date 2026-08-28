require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Semester = require('./src/models/Semester');

const curriculum = {
    1: [
        { code: 'CSE 1101', title: 'Discrete Mathematics', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 1102', title: 'Structured Programming', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'EEE 1101', title: 'Electrical Circuits', credit: 3.0, type: 'Theory', department: 'EEE' },
        { code: 'MATH 1101', title: 'Differential and Integral Calculus', credit: 3.0, type: 'Theory', department: 'MATH' },
        { code: 'GE 1101', title: 'History of Emergence of Bangladesh', credit: 2.0, type: 'Theory', department: 'GE' },
        { code: 'CSE 1103', title: 'Structured Programming Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'EEE 1102', title: 'Electrical Circuits Lab', credit: 1.5, type: 'Laboratory', department: 'EEE' }
    ],
    2: [
        { code: 'CSE 1201', title: 'Object Oriented Programming', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 1202', title: 'Digital Logic Design', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'PHY 1201', title: 'Physics', credit: 3.0, type: 'Theory', department: 'PHY' },
        { code: 'MATH 1201', title: 'Linear Algebra', credit: 3.0, type: 'Theory', department: 'MATH' },
        { code: 'EEE 1201', title: 'Electronic Devices and Circuits', credit: 3.0, type: 'Theory', department: 'EEE' },
        { code: 'CSE 1203', title: 'Object Oriented Programming Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 1204', title: 'Digital Logic Design Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'EEE 1202', title: 'Electronic Devices and Circuits Lab', credit: 1.5, type: 'Laboratory', department: 'EEE' }
    ],
    3: [
        { code: 'CSE 2101', title: 'Data Structures and Algorithms', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 2102', title: 'Computer Architecture', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 2103', title: 'Software Engineering', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'MATH 2101', title: 'Ordinary Differential Equations', credit: 3.0, type: 'Theory', department: 'MATH' },
        { code: 'CSE 2104', title: 'Data Structures and Algorithms Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 2105', title: 'Software Engineering Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ],
    4: [
        { code: 'CSE 2201', title: 'Database Management Systems', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 2202', title: 'Design and Analysis of Algorithms', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 2203', title: 'Microprocessors and Microcontrollers', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'STAT 2201', title: 'Probability and Statistics', credit: 3.0, type: 'Theory', department: 'STAT' },
        { code: 'CSE 2204', title: 'Database Management Systems Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 2205', title: 'Design and Analysis of Algorithms Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 2206', title: 'Microprocessors and Microcontrollers Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ],
    5: [
        { code: 'CSE 3101', title: 'Operating Systems', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3102', title: 'Web Engineering', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3103', title: 'Data Communication', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3104', title: 'Operating Systems Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 3105', title: 'Web Engineering Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ],
    6: [
        { code: 'CSE 3201', title: 'Computer Networks', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3202', title: 'Artificial Intelligence', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3203', title: 'Compiler Design', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 3204', title: 'Computer Networks Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 3205', title: 'Artificial Intelligence Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' },
        { code: 'CSE 3206', title: 'Compiler Design Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ],
    7: [
        { code: 'CSE 4101', title: 'Machine Learning', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 4102', title: 'Information Security', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 4103', title: 'Project/Thesis Part I', credit: 2.0, type: 'Project/Thesis', department: 'CSE' },
        { code: 'CSE 4104', title: 'Machine Learning Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ],
    8: [
        { code: 'CSE 4201', title: 'Parallel and Distributed Systems', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 4202', title: 'IT Business and Professional Ethics', credit: 3.0, type: 'Theory', department: 'CSE' },
        { code: 'CSE 4203', title: 'Project/Thesis Part II', credit: 4.0, type: 'Project/Thesis', department: 'CSE' },
        { code: 'CSE 4204', title: 'Parallel and Distributed Systems Lab', credit: 1.5, type: 'Laboratory', department: 'CSE' }
    ]
};

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const semesters = await Semester.find().sort({ number: 1 });
    
    await Course.deleteMany({});
    
    const coursesToInsert = [];
    
    for (let i = 0; i < semesters.length; i++) {
        const sem = semesters[i];
        const semNumber = sem.number;
        const semCourses = curriculum[semNumber];
        
        if (semCourses) {
            semCourses.forEach(c => {
                coursesToInsert.push({
                    ...c,
                    semesterId: sem._id
                });
            });
        }
    }
    
    await Course.insertMany(coursesToInsert);
    console.log(`Seeded ${coursesToInsert.length} courses across ${semesters.length} semesters.`);
    process.exit(0);
}

seed();
