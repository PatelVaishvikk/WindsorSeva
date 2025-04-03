import connectDb from '../../lib/db';
import CallLog from '../../models/CallLog';
import Student from '../../models/Student';

export default async function handler(req, res) {
  await connectDb();
  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const { page, limit, search } = req.query;
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter for search (by student name/email/phone or notes or status)
        let filter = {};
        if (search && search.trim()) {
          const term = search.trim();
          const regex = new RegExp(term, 'i');
          // Find matching students by name, email, or phone
          const matchingStudents = await Student.find({
            $or: [
              { first_name: regex },
              { last_name: regex },
              { mail_id: regex },
              { phone: regex }
            ]
          }).select('_id');
          const studentIds = matchingStudents.map(s => s._id);
          filter.$or = [
            { notes: regex },
            { status: regex }
          ];
          if (studentIds.length > 0) {
            filter.$or.push({ student_id: { $in: studentIds } });
          }
        }

        // Total count for pagination
        const total = await CallLog.countDocuments(filter);

        // Fetch call logs with pagination and populate student info
        const logsQuery = CallLog.find(filter)
          .populate('student_id')
          .sort({ timestamp: -1 })  // newest call logs first
          .skip(skip)
          .limit(limitNum);
        const logs = await logsQuery.lean({ virtuals: false });  // get plain objects

        // Transform logs: attach student object and formatted date
        const callLogs = logs.map(log => {
          // Rename and include student info
          const studentInfo = log.student_id || null;
          // Convert ObjectIds to strings and Dates to ISO strings
          if (studentInfo && studentInfo._id) {
            studentInfo._id = studentInfo._id.toString();
          }
          return {
            _id: log._id.toString(),
            student: studentInfo ? { ...studentInfo } : null,
            status: log.status,
            notes: log.notes,
            needs_follow_up: log.needs_follow_up,
            follow_up_date: log.follow_up_date ? new Date(log.follow_up_date).toISOString() : null,
            date: new Date(log.timestamp).toISOString()  // date of call (as ISO string)
          };
        });

        res.status(200).json({ callLogs, total, currentPage: pageNum });
      } catch (err) {
        console.error('Error fetching call logs:', err);
        res.status(500).json({ error: 'Failed to fetch call logs' });
      }
      break;
    }
    case 'POST': {
      try {
        const data = req.body;
        // Validate that a student ID is provided
        if (!data.student_id) {
          return res.status(400).json({ error: 'Student ID is required' });
        }
        // Ensure the referenced student exists
        const student = await Student.findById(data.student_id);
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        // Convert follow_up_date string to Date if provided
        if (data.follow_up_date) {
          data.follow_up_date = new Date(data.follow_up_date);
        }
        const newCallLog = new CallLog({
          student_id: data.student_id,
          status: data.status || 'Completed',
          notes: data.notes || '',
          needs_follow_up: !!data.needs_follow_up,
          follow_up_date: data.follow_up_date || (data.needs_follow_up ? undefined : null)
        });
        await newCallLog.save();
        const callLogObj = newCallLog.toObject();
        callLogObj._id = callLogObj._id.toString();
        res.status(201).json({ callLog: callLogObj });
      } catch (err) {
        console.error('Error saving call log:', err);
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ error: messages.join('; ') });
        }
        res.status(500).json({ error: 'Failed to save call log' });
      }
      break;
    }
    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing call log id' });
      }
      try {
        const deletedLog = await CallLog.findByIdAndDelete(id);
        if (!deletedLog) {
          return res.status(404).json({ error: 'Call log not found' });
        }
        res.status(200).json({ message: 'Call log deleted successfully' });
      } catch (err) {
        console.error('Error deleting call log:', err);
        res.status(500).json({ error: 'Failed to delete call log' });
      }
      break;
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
    }
  }
}
