// pages/api/attendance.js
import connectDb from '../../lib/db';
import Attendance from '../../models/Attendance';

export default async function handler(req, res) {
  await connectDb();
  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const { assemblyDate, studentId, page, limit, startDate, endDate } = req.query;
        const filter = {};
        if (assemblyDate) {
          const start = new Date(assemblyDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(assemblyDate);
          end.setHours(23, 59, 59, 999);
          filter.assemblyDate = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.assemblyDate = { $gte: start, $lte: end };
        }
        if (studentId) {
          filter.student = studentId;
        }
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '10', 10);
        const total = await Attendance.countDocuments(filter);
        const attendances = await Attendance.find(filter)
          .populate('student')
          .sort({ assemblyDate: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean();

        res.status(200).json({ attendances, total, page: pageNum });
      } catch (err) {
        console.error('Error fetching attendance records:', err);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
      }
      break;
    }
    case 'POST': {
      try {
        const { student, assemblyDate, attended } = req.body;
        if (!student || !assemblyDate) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        const newAttendance = new Attendance({
          student,
          assemblyDate: new Date(assemblyDate),
          attended: attended === true
        });
        await newAttendance.save();

        // Broadcast new attendance record via Socket.IO
        if (global.io) {
          global.io.emit('attendanceUpdate', { attendance: newAttendance });
        }

        res.status(201).json({ attendance: newAttendance });
      } catch (err) {
        console.error('Error creating attendance record:', err);
        res.status(500).json({ error: 'Failed to create attendance record' });
      }
      break;
    }
    case 'PUT': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing attendance record id' });
      }
      try {
        const updateFields = req.body;
        if (updateFields.assemblyDate) {
          updateFields.assemblyDate = new Date(updateFields.assemblyDate);
        }
        const updated = await Attendance.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updated) {
          return res.status(404).json({ error: 'Attendance record not found' });
        }
        res.status(200).json({ attendance: updated });
      } catch (err) {
        console.error('Error updating attendance record:', err);
        res.status(500).json({ error: 'Failed to update attendance record' });
      }
      break;
    }
    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing attendance record id' });
      }
      try {
        const deleted = await Attendance.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Attendance record not found' });
        }
        res.status(200).json({ message: 'Attendance record deleted successfully' });
      } catch (err) {
        console.error('Error deleting attendance record:', err);
        res.status(500).json({ error: 'Failed to delete attendance record' });
      }
      break;
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
    }
  }
}