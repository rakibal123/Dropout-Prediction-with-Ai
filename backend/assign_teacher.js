require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Semester = require('./src/models/Semester');
const TeacherCourseAssignment = require('./src/models/TeacherCourseAssignment');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        try {
            console.log("Connected to DB.");

            // 1. Find teacher teacher2@university.edu
            const teacher = await User.findOne({ email: 'teacher2@university.edu', role: 'teacher' });
            if (!teacher) {
                console.log("Teacher not found");
                process.exit(1);
            }

            console.log("Found Teacher:", teacher.fullName);

            // 2. Fetch all semesters
            const semesters = await Semester.find().sort({ number: 1 });
            if (semesters.length === 0) {
                console.log("No semesters found");
                process.exit(1);
            }

            // 3. Clear existing assignments for this teacher
            await TeacherCourseAssignment.deleteMany({ teacherId: teacher._id });
            console.log("Cleared old assignments.");

            // 4. Assign the teacher to 1-2 courses per semester
            const newAssignments = [];
            
            for (const sem of semesters) {
                // Get courses for this semester
                const courses = await Course.find({ semesterId: sem._id });
                if (courses.length > 0) {
                    // Assign first theory course and first lab course to Ozifa
                    const theoryCourse = courses.find(c => c.type === 'Theory');
                    const labCourse = courses.find(c => c.type === 'Laboratory');
                    
                    if (theoryCourse) {
                        newAssignments.push({
                            teacherId: teacher._id,
                            courseId: theoryCourse._id,
                            semesterId: sem._id
                        });
                        theoryCourse.teacher = teacher._id;
                        await theoryCourse.save();
                    }
                    if (labCourse) {
                        newAssignments.push({
                            teacherId: teacher._id,
                            courseId: labCourse._id,
                            semesterId: sem._id
                        });
                        labCourse.teacher = teacher._id;
                        await labCourse.save();
                    }
                }
            }

            if (newAssignments.length > 0) {
                await TeacherCourseAssignment.insertMany(newAssignments);
                console.log(`Successfully assigned ${newAssignments.length} courses to Ozifa!`);
            } else {
                console.log("No courses available to assign.");
            }

        } catch (err) {
            console.error("Error:", err);
        } finally {
            mongoose.disconnect();
            console.log("Done.");
            process.exit(0);
        }
    });
