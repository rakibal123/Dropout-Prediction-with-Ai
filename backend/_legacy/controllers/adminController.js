const User = require('../models/User');

// @desc    Get all pending students
// @route   GET /api/admin/pending-students
// @access  Private (Admin/Teacher)
exports.getPendingStudents = async (req, res) => {
    try {
        const pendingStudents = await User.find({
            role: 'student',
            status: 'pending'
        }).select('-password');

        res.status(200).json({
            status: 'success',
            results: pendingStudents.length,
            data: {
                students: pendingStudents
            }
        });
    } catch (err) {
        console.error('Error fetching pending students:', err);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching pending students'
        });
    }
};

// @desc    Approve a pending student
// @route   PUT /api/admin/approve-student/:id
// @access  Private (Admin/Teacher)
exports.approveStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Find the user first to ensure they are a student
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        if (student.role !== 'student') {
            return res.status(400).json({
                status: 'fail',
                message: 'Only students can be approved through this endpoint'
            });
        }

        if (student.status === 'approved' || student.approved === true) {
            return res.status(400).json({
                status: 'fail',
                message: 'Student is already approved'
            });
        }

        // Find and update the document directly
        const updatedStudent = await User.findByIdAndUpdate(
            studentId,
            { status: 'approved', approved: true },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: 'Student approved successfully',
            data: {
                student: updatedStudent
            }
        });

    } catch (err) {
        console.error('Error approving student:', err);

        // Handle invalid MongoDB ObjectId
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid student ID format'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error while approving student'
        });
    }
};

// @desc    Reject a pending student
// @route   PUT /api/admin/reject-student/:id
// @access  Private (Admin/Teacher)
exports.rejectStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ status: 'fail', message: 'Only students can be rejected through this endpoint' });
        }

        if (student.status === 'rejected') {
            return res.status(400).json({ status: 'fail', message: 'Student account is already rejected' });
        }

        const updatedStudent = await User.findByIdAndUpdate(
            studentId,
            { status: 'rejected', approved: false },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            status: 'success',
            message: 'Student account rejected',
            data: {
                student: updatedStudent
            }
        });

    } catch (err) {
        console.error('Error rejecting student:', err);

        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return res.status(400).json({ status: 'fail', message: 'Invalid student ID format' });
        }

        res.status(500).json({ status: 'error', message: 'Internal server error while rejecting student' });
    }
};
