// models/Attendance.js
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: [true, 'Student reference is required'] 
  },
  assemblyDate: { 
    type: Date, 
    required: [true, 'Assembly date is required'] 
  },
  attended: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
AttendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

// models/Attendance.js


