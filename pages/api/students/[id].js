import connectDb from '../../../config/db';
import Student from '../../../models/Student';

export default async function handler(req, res) {
    const { id } = req.query;
    await connectDb();

    // Get Single Student
    if (req.method === 'GET') {
        try {
            const student = await Student.findOne({ student_index: id });
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }
            res.status(200).json(student);
        } catch (err) {
            console.error('Error in getStudent:', err);
            res.status(500).json({ error: err.message });
        }
    }
    // Update Student
    else if (req.method === 'PUT') {
        const { first_name, last_name, mail_id, address, phone } = req.body;
        try {
            const updatedStudent = await Student.findOneAndUpdate(
                { student_index: id },
                { first_name, last_name, mail_id, address, phone },
                { new: true }
            );

            if (!updatedStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
        } catch (err) {
            console.error('Error in updateStudent:', err);
            res.status(500).json({ error: err.message });
        }
    }
    // Delete Student
    else if (req.method === 'DELETE') {
        try {
            const deletedStudent = await Student.findOneAndDelete({ student_index: id });

            if (!deletedStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.status(200).json({ message: 'Student deleted successfully' });
        } catch (err) {
            console.error('Error in deleteStudent:', err);
            res.status(500).json({ error: err.message });
        }
    }
    else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
