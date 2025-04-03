import mongoose from 'mongoose';

const CallLogSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Completed', 'No Answer', 'Left Message', 'Rescheduled'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  needs_follow_up: {
    type: Boolean,
    default: false
  },
  follow_up_date: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at timestamp before saving
CallLogSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Validate that follow_up_date is provided if follow-up is needed
CallLogSchema.pre('save', function(next) {
  if (this.needs_follow_up && !this.follow_up_date) {
    return next(new Error('Follow-up date is required when follow-up is needed'));
  }
  next();
});

export default mongoose.models.CallLog || mongoose.model('CallLog', CallLogSchema);
