const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const User = require('../models/User');
const TeacherCourseAssignment = require('../models/TeacherCourseAssignment');
const CourseEnrollment = require('../models/CourseEnrollment');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAcademicData = async () => {
    try {
        const semesterCount = await Semester.countDocuments();
        if (semesterCount > 0) {
            console.log('Academic data already seeded.');
            return;
        }

        const sem2 = await Semester.create({ name: 'Semester 2', number: 2 });
        const sem4 = await Semester.create({ name: 'Semester 4', number: 4 });
        const sem5 = await Semester.create({ name: 'Semester 5', number: 5 });
        const sem7 = await Semester.create({ name: 'Semester 7', number: 7 });

        const courseDataStructures = await Course.create({ code: 'CSE 1201', title: 'Data Structures', credit: 3, semesterId: sem2._id });
        const courseSoftwareEng = await Course.create({ code: 'CSE 2203', title: 'Software Engineering', credit: 3, semesterId: sem4._id });
        const courseAI = await Course.create({ code: 'CSE 3101', title: 'Artificial Intelligence', credit: 3, semesterId: sem5._id });
        const courseTesting = await Course.create({ code: 'CSE 4102', title: 'Software Testing', credit: 3, semesterId: sem7._id });

        const createTeacher = async (name, email) => {
            let t = await User.findOne({ email });
            if (!t) {
                const hashedPassword = await bcrypt.hash('password123', 12);
                t = await User.create({
                    fullName: name, email, password: hashedPassword, role: 'teacher', status: 'approved'
                });
            }
            return t;
        };

        const teacherOzifa = await createTeacher("Ozifa Ma'am", 'ozifa@university.edu');
        const teacherRownok = await createTeacher("Rownok Ara Chowdhury", 'rownok@university.edu');
        const teacherSetu = await createTeacher("Setu Ma'am", 'setu@university.edu');

        await TeacherCourseAssignment.create({ teacherId: teacherOzifa._id, courseId: courseDataStructures._id, semesterId: sem2._id, academicYear: 2026 });
        await TeacherCourseAssignment.create({ teacherId: teacherOzifa._id, courseId: courseSoftwareEng._id, semesterId: sem4._id, academicYear: 2026 });
        await TeacherCourseAssignment.create({ teacherId: teacherOzifa._id, courseId: courseTesting._id, semesterId: sem7._id, academicYear: 2026 });
        
        await TeacherCourseAssignment.create({ teacherId: teacherRownok._id, courseId: courseSoftwareEng._id, semesterId: sem4._id, academicYear: 2026 });
        
        await TeacherCourseAssignment.create({ teacherId: teacherSetu._id, courseId: courseAI._id, semesterId: sem5._id, academicYear: 2026 });
        await TeacherCourseAssignment.create({ teacherId: teacherOzifa._id, courseId: courseAI._id, semesterId: sem5._id, academicYear: 2026 }); 

        let studentA = await User.findOne({ email: 'studentA@university.edu' });
        if (!studentA) {
            const hashedPassword = await bcrypt.hash('password123', 12);
            studentA = await User.create({
                fullName: 'Student A', email: 'studentA@university.edu', password: hashedPassword, role: 'student', status: 'approved', rollNumber: 'CS-2026-001', registrationNumber: 'REG-001'
            });
        }

        await CourseEnrollment.create({ studentId: studentA._id, courseId: courseAI._id, semesterId: sem5._id, academicYear: 2026 });
        await CourseEnrollment.create({ studentId: studentA._id, courseId: courseSoftwareEng._id, semesterId: sem4._id, academicYear: 2026 });

        console.log('Successfully seeded Semesters, Courses, Teachers, Assignments, and Student Enrollments.');
    } catch (err) {
        console.error('Error seeding academic data:', err);
    }
};

module.exports = seedAcademicData;
