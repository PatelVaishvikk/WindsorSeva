import connectDb from '../../lib/db';
import Student from '../../models/Student';
import CallLog from '../../models/CallLog';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDb();

        // Get total students count
        const totalStudents = await Student.countDocuments();

        // Get total calls count
        const totalCalls = await CallLog.countDocuments();

        // Get completed calls count
        const completedCalls = await CallLog.countDocuments({ status: 'Completed' });

        // Get pending calls (calls with needs_follow_up = true or status != 'Completed')
        const pendingCalls = await CallLog.countDocuments({
            $or: [
                { needs_follow_up: true },
                { status: { $ne: 'Completed' } }
            ]
        });

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                totalCalls,
                completedCalls,
                pendingCalls
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
} 