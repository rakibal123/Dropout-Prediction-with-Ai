const mongoose = require('mongoose');
const User = require('../models/User');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const TeacherCourseAssignment = require('../models/TeacherCourseAssignment');
const logger = require('./logger');

const teachersData = [
    { fullName: "Ozifa Ma'am", email: "ozifa@university.edu" },
    { fullName: "Rownok Ara Chowdhury", email: "rownok@university.edu" },
    { fullName: "Setu Ma'am", email: "setu@university.edu" },
    { fullName: "Ismail Sir", email: "ismail@university.edu" },
    { fullName: "Mahfuz Sir", email: "mahfuz@university.edu" },
    { fullName: "Nusrat Jahan", email: "nusrat@university.edu" },
    { fullName: "Farhana Yasmin", email: "farhana@university.edu" },
    { fullName: "Tanvir Ahmed", email: "tanvir@university.edu" },
    { fullName: "Md. Saiful Islam", email: "saiful@university.edu" },
    { fullName: "Shahriar Hossain", email: "shahriar@university.edu" }
];

const semestersData = [
    { number: 1, name: "Semester 1", academicYear: "2024-2025" },
    { number: 2, name: "Semester 2", academicYear: "2024-2025" },
    { number: 3, name: "Semester 3", academicYear: "2024-2025" },
    { number: 4, name: "Semester 4", academicYear: "2024-2025" },
    { number: 5, name: "Semester 5", academicYear: "2024-2025" },
    { number: 6, name: "Semester 6", academicYear: "2024-2025" },
    { number: 7, name: "Semester 7", academicYear: "2024-2025" },
    { number: 8, name: "Semester 8", academicYear: "2024-2025" }
];

const coursesData = {
    1: [
        { code: "CSE 1101", title: "Structured Programming", credit: 3, type: "Theory" },
        { code: "CSE 1102", title: "Structured Programming Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 1103", title: "Discrete Mathematics", credit: 3, type: "Theory" },
        { code: "EEE 1101", title: "Electrical Circuits", credit: 3, type: "Theory" },
        { code: "MAT 1101", title: "Differential and Integral Calculus", credit: 3, type: "Theory" },
        { code: "ENG 1101", title: "English Language Skills", credit: 3, type: "Theory" }
    ],
    2: [
        { code: "CSE 1201", title: "Object Oriented Programming", credit: 3, type: "Theory" },
        { code: "CSE 1202", title: "Object Oriented Programming Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 1203", title: "Data Structures", credit: 3, type: "Theory" },
        { code: "CSE 1204", title: "Data Structures Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "MAT 1201", title: "Linear Algebra", credit: 3, type: "Theory" },
        { code: "PHY 1201", title: "Physics", credit: 3, type: "Theory" }
    ],
    3: [
        { code: "CSE 2101", title: "Algorithms", credit: 3, type: "Theory" },
        { code: "CSE 2102", title: "Algorithms Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 2103", title: "Database Management Systems", credit: 3, type: "Theory" },
        { code: "CSE 2104", title: "Database Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 2105", title: "Digital Logic Design", credit: 3, type: "Theory" },
        { code: "STAT 2101", title: "Probability and Statistics", credit: 3, type: "Theory" }
    ],
    4: [
        { code: "CSE 2201", title: "Computer Architecture", credit: 3, type: "Theory" },
        { code: "CSE 2202", title: "Operating Systems", credit: 3, type: "Theory" },
        { code: "CSE 2203", title: "Operating Systems Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 2204", title: "Software Engineering", credit: 3, type: "Theory" },
        { code: "CSE 2205", title: "Computer Networks", credit: 3, type: "Theory" },
        { code: "CSE 2206", title: "Numerical Methods", credit: 3, type: "Theory" }
    ],
    5: [
        { code: "CSE 3101", title: "Artificial Intelligence", credit: 3, type: "Theory" },
        { code: "CSE 3102", title: "Artificial Intelligence Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 3103", title: "Web Engineering", credit: 3, type: "Theory" },
        { code: "CSE 3104", title: "Web Engineering Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 3105", title: "Theory of Computation", credit: 3, type: "Theory" },
        { code: "CSE 3106", title: "Microprocessor and Embedded Systems", credit: 3, type: "Theory" }
    ],
    6: [
        { code: "CSE 3201", title: "Machine Learning", credit: 3, type: "Theory" },
        { code: "CSE 3202", title: "Machine Learning Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 3203", title: "Computer Networks Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 3204", title: "Compiler Design", credit: 3, type: "Theory" },
        { code: "CSE 3205", title: "Information Security", credit: 3, type: "Theory" },
        { code: "CSE 3206", title: "Human Computer Interaction", credit: 3, type: "Theory" }
    ],
    7: [
        { code: "CSE 4101", title: "Deep Learning", credit: 3, type: "Theory" },
        { code: "CSE 4102", title: "Deep Learning Laboratory", credit: 1.5, type: "Laboratory" },
        { code: "CSE 4103", title: "Distributed Systems", credit: 3, type: "Theory" },
        { code: "CSE 4104", title: "Software Testing and Quality Assurance", credit: 3, type: "Theory" },
        { code: "CSE 4105", title: "Data Mining", credit: 3, type: "Theory" },
        { code: "CSE 4106", title: "Research Methodology", credit: 3, type: "Theory" }
    ],
    8: [
        { code: "CSE 4201", title: "Natural Language Processing", credit: 3, type: "Theory" },
        { code: "CSE 4202", title: "Cloud Computing", credit: 3, type: "Theory" },
        { code: "CSE 4203", title: "Big Data Analytics", credit: 3, type: "Theory" },
        { code: "CSE 4204", title: "Project/Thesis", credit: 6, type: "Project/Thesis" },
        { code: "CSE 4205", title: "Professional Ethics", credit: 3, type: "Theory" },
        { code: "CSE 4206", title: "Internship/Industrial Training", credit: 3, type: "Industrial Training" }
    ]
};

const seedAcademicData = async () => {
    try {
        logger.info("Starting Academic Data Seed...");

        // 1. Seed Teachers
        let teacherDocs = [];
        for (const t of teachersData) {
            let teacher = await User.findOne({ email: t.email });
            if (!teacher) {
                teacher = await User.create({
                    ...t,
                    password: "TeacherPassword123!",
                    role: "teacher",
                    status: "approved",
                    approved: true,
                    department: "CSE"
                });
                logger.info(`Seeded Teacher: ${teacher.fullName}`);
            }
            teacherDocs.push(teacher);
        }

        // 2. Seed Semesters and Courses
        for (const sData of semestersData) {
            let semester = await Semester.findOne({ number: sData.number });
            if (!semester) {
                semester = await Semester.create(sData);
                logger.info(`Seeded Semester: ${semester.name}`);
            }

            const coursesForSem = coursesData[sData.number];
            for (const cData of coursesForSem) {
                let course = await Course.findOne({ code: cData.code, semesterId: semester._id });
                if (!course) {
                    course = await Course.create({ ...cData, semesterId: semester._id });
                    logger.info(`Seeded Course: ${course.code}`);
                }
            }
        }

        // 3. Assign Demo Teachers
        const ozifa = await User.findOne({ email: "ozifa@university.edu" });
        const rownok = await User.findOne({ email: "rownok@university.edu" });
        const setu = await User.findOne({ email: "setu@university.edu" });
        const ismail = await User.findOne({ email: "ismail@university.edu" });
        const mahfuz = await User.findOne({ email: "mahfuz@university.edu" });

        const sem5 = await Semester.findOne({ number: 5 });
        const sem4 = await Semester.findOne({ number: 4 });
        const sem7 = await Semester.findOne({ number: 7 });
        const sem8 = await Semester.findOne({ number: 8 });

        if (sem5 && ozifa && rownok) {
            const ai = await Course.findOne({ code: "CSE 3101", semesterId: sem5._id });
            const web = await Course.findOne({ code: "CSE 3103", semesterId: sem5._id });
            
            if (ai) await TeacherCourseAssignment.updateOne({ teacherId: ozifa._id, courseId: ai._id, semesterId: sem5._id }, { academicYear: "2024-2025" }, { upsert: true });
            if (web) await TeacherCourseAssignment.updateOne({ teacherId: rownok._id, courseId: web._id, semesterId: sem5._id }, { academicYear: "2024-2025" }, { upsert: true });
        }

        if (sem7 && setu) {
            const dl = await Course.findOne({ code: "CSE 4101", semesterId: sem7._id });
            if (dl) await TeacherCourseAssignment.updateOne({ teacherId: setu._id, courseId: dl._id, semesterId: sem7._id }, { academicYear: "2024-2025" }, { upsert: true });
        }

        if (sem4 && ismail) {
            const se = await Course.findOne({ code: "CSE 2204", semesterId: sem4._id });
            if (se) await TeacherCourseAssignment.updateOne({ teacherId: ismail._id, courseId: se._id, semesterId: sem4._id }, { academicYear: "2024-2025" }, { upsert: true });
        }

        if (sem8 && mahfuz) {
            const nlp = await Course.findOne({ code: "CSE 4201", semesterId: sem8._id });
            if (nlp) await TeacherCourseAssignment.updateOne({ teacherId: mahfuz._id, courseId: nlp._id, semesterId: sem8._id }, { academicYear: "2024-2025" }, { upsert: true });
        }

        logger.info("Academic Data Seed Complete!");
    } catch (error) {
        logger.error(`Error seeding academic data: ${error.message}`);
    }
};

module.exports = seedAcademicData;
