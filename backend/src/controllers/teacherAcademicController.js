const TeacherCourseAssignment = require('../models/TeacherCourseAssignment');
const CourseEnrollment = require('../models/CourseEnrollment');
const CourseStudentData = require('../models/CourseStudentData');
const User = require('../models/User');
const UploadRecord = require('../models/UploadRecord');
const multer = require('multer');
const xlsx = require('xlsx');

// Multer setup for temporary storage (in memory)
const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.getMyTeachingCourses = async (req, res) => {
    try {
        const assignments = await TeacherCourseAssignment.find({ teacherId: req.user.id })
            .populate('courseId')
            .populate('semesterId');
            
        // Group by semester
        const myTeaching = {};
        for (const assign of assignments) {
            const semId = assign.semesterId._id.toString();
            if (!myTeaching[semId]) {
                myTeaching[semId] = {
                    semester: assign.semesterId,
                    courses: []
                };
            }
            
            // Get student count for this course in this semester
            const studentCount = await CourseEnrollment.countDocuments({ 
                courseId: assign.courseId._id, 
                semesterId: assign.semesterId._id,
                status: 'Enrolled'
            });
            
            // Get assessed students count
            const assessedCount = await CourseStudentData.countDocuments({
                courseId: assign.courseId._id,
                semesterId: assign.semesterId._id
            });
            
            myTeaching[semId].courses.push({
                course: assign.courseId,
                studentsCount: studentCount,
                assessedCount: assessedCount
            });
        }
        
        res.status(200).json({ status: 'success', data: { myTeaching: Object.values(myTeaching) } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { semesterId } = req.query; // Expect semesterId in query
        
        if (!semesterId) return res.status(400).json({ status: 'fail', message: 'semesterId is required' });

        // Verify assignment
        const assignment = await TeacherCourseAssignment.findOne({ teacherId: req.user.id, courseId, semesterId });
        if (!assignment) return res.status(403).json({ status: 'fail', message: 'Not authorized for this course' });
        
        const enrollments = await CourseEnrollment.find({ courseId, semesterId, status: 'Enrolled' })
            .populate('studentId', 'fullName email rollNumber registrationNumber');
            
        const students = await Promise.all(enrollments.map(async (enr) => {
            const data = await CourseStudentData.findOne({ studentId: enr.studentId._id, courseId, semesterId });
            return {
                student: enr.studentId,
                dataStatus: data ? 'Available' : 'Pending',
                riskLevel: data ? data.courseRiskLevel : 'No Data',
                data: data || null
            };
        }));
        
        res.status(200).json({ status: 'success', data: { students } });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.downloadExcelTemplate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { semesterId } = req.query;
        
        const assignment = await TeacherCourseAssignment.findOne({ teacherId: req.user.id, courseId, semesterId }).populate('courseId');
        if (!assignment) return res.status(403).json({ status: 'fail', message: 'Not authorized for this course' });
        
        const enrollments = await CourseEnrollment.find({ courseId, semesterId, status: 'Enrolled' }).populate('studentId', 'fullName rollNumber registrationNumber');
        
        const data = enrollments.map(enr => ({
            'Roll Number': enr.studentId.rollNumber,
            'Registration Number': enr.studentId.registrationNumber,
            'Student Name': enr.studentId.fullName,
            'Attendance (%)': '',
            'Assignment Submission (%)': '',
            'Quiz Average (Out of 100)': '',
            'CT Marks (Out of 100)': '',
            'Midterm Marks (Out of 100)': '',
            'Final Marks (Out of 100)': '',
            'Study Hours Per Week': '',
            'Class Engagement (0-100)': '',
            'Participation (0-100)': '',
            'Missed Assessments': ''
        }));
        
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="${assignment.courseId.code}_Template.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

exports.uploadCourseData = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ status: 'fail', message: 'File upload error' });
        
        try {
            const { courseId } = req.params;
            const { semesterId } = req.body;
            
            if (!semesterId) return res.status(400).json({ status: 'fail', message: 'semesterId is required' });
            
            // Verify assignment
            const assignment = await TeacherCourseAssignment.findOne({ teacherId: req.user.id, courseId, semesterId });
            if (!assignment) return res.status(403).json({ status: 'fail', message: 'Not authorized for this course' });
            
            if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
            
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
            
            let valid = 0;
            let invalid = 0;
            const errors = [];
            
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const roll = String(row['Roll Number']).trim();
                
                // Find student by roll
                const student = await User.findOne({ rollNumber: roll, role: 'student' });
                if (!student) {
                    invalid++;
                    errors.push({ row: i+2, message: `Student with roll ${roll} not found.` });
                    continue;
                }
                
                // Verify enrollment
                const enrollment = await CourseEnrollment.findOne({ studentId: student._id, courseId, semesterId });
                if (!enrollment) {
                    invalid++;
                    errors.push({ row: i+2, message: `Student ${roll} is not enrolled in this course.` });
                    continue;
                }
                
                // Upsert CourseStudentData without risk first

                const savedData = await CourseStudentData.findOneAndUpdate(
                    { studentId: student._id, courseId, semesterId },
                    {
                        uploadedBy: req.user.id,
                        attendancePercentage: Number(row['Attendance (%)']) || 0,
                        assignmentSubmissionRate: Number(row['Assignment Submission (%)']) || 0,
                        quizAverage: Number(row['Quiz Average (Out of 100)']) || 0,
                        ctMarks: Number(row['CT Marks (Out of 100)']) || 0,
                        midtermMarks: mid,
                        finalMarks: Number(row['Final Marks (Out of 100)']) || 0,
                        studyHoursPerWeek: Number(row['Study Hours Per Week']) || 0,
                        classEngagement: Number(row['Class Engagement (0-100)']) || 0,
                        participationInActivities: Number(row['Participation (0-100)']) || 0,
                        missedAssessments: Number(row['Missed Assessments']) || 0
                    },
                    { upsert: true, new: true }
                );
                
                // Call ML prediction
                const predictionService = require('../services/predictionService');
                try {
                    await predictionService.predictForCourse(savedData._id);
                    valid++;
                } catch (mlErr) {
                    // It's still valid data, but prediction failed
                    console.error("ML Prediction failed for student", student._id, mlErr);
                    valid++; // We count it as valid data upload even if ML fails
                }
            }
            
            // Record upload history
            await UploadRecord.create({
                teacherId: req.user.id,
                courseId,
                semesterId,
                fileName: req.file.originalname,
                totalRecords: data.length,
                validRecords: valid,
                invalidRecords: invalid
            });
            
            res.status(200).json({ 
                status: 'success', 
                message: 'Upload complete', 
                data: { total: data.length, valid, invalid, errors }
            });
            
        } catch (error) {
            res.status(400).json({ status: 'fail', message: error.message });
        }
    });
};
exports.uploadManualData = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { semesterId, studentId, attendancePercentage, assignmentSubmissionRate, quizAverage, ctMarks, midtermMarks, finalMarks, studyHoursPerWeek, classEngagement, participationInActivities, missedAssessments } = req.body;
        
        if (!semesterId || !studentId) return res.status(400).json({ status: 'fail', message: 'semesterId and studentId are required' });
        
        // Verify assignment
        const assignment = await TeacherCourseAssignment.findOne({ teacherId: req.user.id, courseId, semesterId });
        if (!assignment) return res.status(403).json({ status: 'fail', message: 'Not authorized for this course' });
        
        // Verify enrollment
        const enrollment = await CourseEnrollment.findOne({ studentId, courseId, semesterId });
        if (!enrollment) return res.status(400).json({ status: 'fail', message: 'Student is not enrolled in this course.' });
        
        // Upsert CourseStudentData without risk first
        const data = await CourseStudentData.findOneAndUpdate(
            { studentId, courseId, semesterId },
            {
                uploadedBy: req.user.id,
                attendancePercentage: Number(attendancePercentage) || 0,
                assignmentSubmissionRate: Number(assignmentSubmissionRate) || 0,
                quizAverage: Number(quizAverage) || 0,
                ctMarks: Number(ctMarks) || 0,
                midtermMarks: mid,
                finalMarks: Number(finalMarks) || 0,
                studyHoursPerWeek: Number(studyHoursPerWeek) || 0,
                classEngagement: Number(classEngagement) || 0,
                participationInActivities: Number(participationInActivities) || 0,
                missedAssessments: Number(missedAssessments) || 0,
                dataSource: 'manual'
            },
            { upsert: true, new: true }
        );
        
        // Call ML Prediction
        const predictionService = require('../services/predictionService');
        await predictionService.predictForCourse(data._id);
        
        const updatedData = await CourseStudentData.findById(data._id);
        
        res.status(200).json({ status: 'success', message: 'Student data saved and risk calculated', data: updatedData });
        
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};
