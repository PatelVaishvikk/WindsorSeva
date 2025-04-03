// import connectDb from '../../lib/db';
// import Student from '../../models/Student';
// import CallLog from '../../models/CallLog';

// export default async function handler(req, res) {
//   await connectDb();
//   const { method } = req;

//   switch (method) {
//     case 'GET': {
//       try {
//         const { page, limit, search } = req.query;
//         const pageNum = parseInt(page || '1', 10);
//         const limitNum = parseInt(limit || '0', 10); // 0 means no limit
//         const filter = {};

//         if (search && search.trim()) {
//           const searchRegex = new RegExp(search.trim(), 'i');
//           filter.$or = [
//             { first_name: searchRegex },
//             { last_name: searchRegex },
//             { mail_id: searchRegex },
//             { phone: searchRegex }
//           ];
//         }

//         const total = await Student.countDocuments(filter);
//         let studentsQuery = Student.find(filter).sort({ created_at: -1 });
//         if (limitNum > 0) {
//           const skip = (pageNum - 1) * limitNum;
//           studentsQuery = studentsQuery.skip(skip).limit(limitNum);
//         }
//         const studentsList = await studentsQuery.lean();
//         const students = studentsList.map(student => ({
//           ...student,
//           _id: student._id.toString(),
//           ...(student.date_of_birth ? { date_of_birth: new Date(student.date_of_birth).toISOString() } : {})
//         }));
//         res.status(200).json({ students, total, currentPage: pageNum });
//       } catch (err) {
//         console.error('Error fetching students:', err);
//         res.status(500).json({ error: 'Failed to fetch students' });
//       }
//       break;
//     }
//     case 'POST': {
//       try {
//         const data = req.body;
//         // Normalize the email if provided; default to empty string
//         const normalizedEmail = data.mail_id ? data.mail_id.trim().toLowerCase() : '';
//         console.log('Normalized email:', normalizedEmail);
//         data.mail_id = normalizedEmail;
//         // Only perform duplicate check if email is non-empty
//         if (normalizedEmail !== '') {
//           const existingStudent = await Student.findOne({ mail_id: normalizedEmail });
//           if (existingStudent) {
//             console.log('Duplicate email found for:', normalizedEmail);
//             return res.status(400).json({ error: 'Email already exists' });
//           }
//         }
//         const newStudent = new Student(data);
//         await newStudent.save();
//         const studentObj = newStudent.toObject();
//         studentObj._id = studentObj._id.toString();
//         res.status(201).json({ student: studentObj });
//       } catch (err) {
//         console.error('Error adding student:', err);
//         if (err.code === 11000) {
//           return res.status(400).json({ error: 'Email already exists' });
//         }
//         if (err.name === 'ValidationError') {
//           const messages = Object.values(err.errors).map(e => e.message);
//           return res.status(400).json({ error: messages.join('; ') });
//         }
//         res.status(500).json({ error: 'Failed to add student' });
//       }
//       break;
//     }
//     case 'PUT': {
//       const { id } = req.query;
//       if (!id) {
//         return res.status(400).json({ error: 'Missing student id' });
//       }
//       try {
//         const student = await Student.findById(id);
//         if (!student) {
//           return res.status(404).json({ error: 'Student not found' });
//         }
//         const fields = ['first_name','last_name','mail_id','phone','address','date_of_birth','gender','education','emergency_contact','notes','interests'];
//         for (const field of fields) {
//           if (req.body.hasOwnProperty(field)) {
//             if (field === 'mail_id') {
//               student.mail_id = req.body.mail_id ? req.body.mail_id.trim().toLowerCase() : '';
//             } else if (field === 'date_of_birth') {
//               student.date_of_birth = req.body.date_of_birth ? new Date(req.body.date_of_birth) : null;
//             } else {
//               student[field] = req.body[field];
//             }
//           }
//         }
//         await student.save();
//         const updatedStudent = student.toObject();
//         updatedStudent._id = updatedStudent._id.toString();
//         res.status(200).json({ student: updatedStudent });
//       } catch (err) {
//         console.error('Error updating student:', err);
//         if (err.code === 11000) {
//           return res.status(400).json({ error: 'Email already exists' });
//         }
//         if (err.name === 'ValidationError') {
//           const messages = Object.values(err.errors).map(e => e.message);
//           return res.status(400).json({ error: messages.join('; ') });
//         }
//         res.status(500).json({ error: 'Failed to update student' });
//       }
//       break;
//     }
//     case 'DELETE': {
//       const { id } = req.query;
//       if (!id) {
//         return res.status(400).json({ error: 'Missing student id' });
//       }
//       try {
//         const deletedStudent = await Student.findByIdAndDelete(id);
//         if (!deletedStudent) {
//           return res.status(404).json({ error: 'Student not found' });
//         }
//         // Also remove associated call logs
//         await CallLog.deleteMany({ student_id: id });
//         res.status(200).json({ message: 'Student deleted successfully' });
//       } catch (err) {
//         console.error('Error deleting student:', err);
//         res.status(500).json({ error: 'Failed to delete student' });
//       }
//       break;
//     }
//     default: {
//       res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//       res.status(405).json({ error: `Method ${method} not allowed` });
//     }
//   }
// }

import connectDb from '../../lib/db';
import Student from '../../models/Student';
import CallLog from '../../models/CallLog';

export default async function handler(req, res) {
  await connectDb();
  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const { page, limit, search } = req.query;
        const pageNum = parseInt(page || '1', 10);
        const limitNum = parseInt(limit || '0', 10); // 0 means no limit
        const filter = {};

        if (search && search.trim()) {
          const searchRegex = new RegExp(search.trim(), 'i');
          filter.$or = [
            { first_name: searchRegex },
            { last_name: searchRegex },
            { mail_id: searchRegex },
            { phone: searchRegex }
          ];
        }

        const total = await Student.countDocuments(filter);
        let studentsQuery = Student.find(filter).sort({ created_at: -1 });
        if (limitNum > 0) {
          const skip = (pageNum - 1) * limitNum;
          studentsQuery = studentsQuery.skip(skip).limit(limitNum);
        }
        const studentsList = await studentsQuery.lean();
        const students = studentsList.map(student => ({
          ...student,
          _id: student._id.toString(),
          ...(student.date_of_birth ? { date_of_birth: new Date(student.date_of_birth).toISOString() } : {})
        }));
        res.status(200).json({ students, total, currentPage: pageNum });
      } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Failed to fetch students' });
      }
      break;
    }
    case 'POST': {
      try {
        const data = req.body;
        // Normalize the email if provided; default to empty string
        const normalizedEmail = data.mail_id ? data.mail_id.trim().toLowerCase() : '';
        console.log('Normalized email:', normalizedEmail);
        data.mail_id = normalizedEmail;
        // Only perform duplicate check if email is non-empty
        if (normalizedEmail !== '') {
          const existingStudent = await Student.findOne({ mail_id: normalizedEmail });
          if (existingStudent) {
            console.log('Duplicate email found for:', normalizedEmail);
            return res.status(400).json({ error: 'Email already exists' });
          }
        }
        const newStudent = new Student(data);
        await newStudent.save();
        const studentObj = newStudent.toObject();
        studentObj._id = studentObj._id.toString();
        res.status(201).json({ student: studentObj });
      } catch (err) {
        console.error('Error adding student:', err);
        if (err.code === 11000) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ error: messages.join('; ') });
        }
        res.status(500).json({ error: 'Failed to add student' });
      }
      break;
    }
    case 'PUT': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing student id' });
      }
      try {
        const student = await Student.findById(id);
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
        // Updated list of fields (remove 'gender' and 'interests' if not used anymore)
        const fields = [
          'first_name',
          'last_name',
          'mail_id',
          'phone',
          'address',
          'date_of_birth',
          'education',
          'emergency_contact',
          'notes',
          'box_cricket',
          'box_cricket_years',
          'atmiya_cricket_tournament',
          'atmiya_cricket_years',
          'atmiya_youth_shibir',
          'atmiya_youth_years',
          'yuva_mahotsav',
          'yuva_mahotsav_years',
          'harimay'
        ];
        for (const field of fields) {
          if (req.body.hasOwnProperty(field)) {
            if (field === 'mail_id') {
              student.mail_id = req.body.mail_id ? req.body.mail_id.trim().toLowerCase() : '';
            } else if (field === 'date_of_birth') {
              student.date_of_birth = req.body.date_of_birth ? new Date(req.body.date_of_birth) : null;
            } else {
              student[field] = req.body[field];
            }
          }
        }
        await student.save();
        const updatedStudent = student.toObject();
        updatedStudent._id = updatedStudent._id.toString();
        res.status(200).json({ student: updatedStudent });
      } catch (err) {
        console.error('Error updating student:', err);
        if (err.code === 11000) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ error: messages.join('; ') });
        }
        res.status(500).json({ error: 'Failed to update student' });
      }
      break;
    }
    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing student id' });
      }
      try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
          return res.status(404).json({ error: 'Student not found' });
        }
        // Also remove associated call logs
        await CallLog.deleteMany({ student_id: id });
        res.status(200).json({ message: 'Student deleted successfully' });
      } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ error: 'Failed to delete student' });
      }
      break;
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} not allowed` });
    }
  }
}
