// import mongoose from 'mongoose';

// const StudentSchema = new mongoose.Schema({
//   first_name: { 
//     type: String, 
//     required: [true, 'First name is required'], 
//     trim: true 
//   },
//   last_name: { 
//     type: String, 
//     required: [true, 'Last name is required'], 
//     trim: true 
//   },
//   mail_id: { 
//     type: String,
//     // Remove required if you want email to be optional.
//     // required: [true, 'Email is required'],
//     unique: true,
//     sparse: true, // Only index documents with a non-empty email.
//     trim: true,
//     lowercase: true,
//     match: [
//       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//       'Please enter a valid email'
//     ]
//   },
//   phone: { 
//     type: String, 
//     required: [true, 'Phone number is required'], 
//     trim: true 
//   },
//   address: { 
//     type: String, 
//     trim: true, 
//     default: '' 
//   },
//   date_of_birth: { 
//     type: Date, 
//     default: null 
//   },
//   gender: { 
//     type: String, 
//     enum: ['male', 'female', 'other', ''], 
//     default: '' 
//   },
//   education: { 
//     type: String, 
//     enum: ['high_school', 'bachelors', 'masters', 'phd', 'other', ''], 
//     default: '' 
//   },
//   emergency_contact: { 
//     type: String, 
//     trim: true, 
//     default: '' 
//   },
//   notes: { 
//     type: String, 
//     trim: true, 
//     default: '' 
//   },
//   interests: { 
//     type: [String], 
//     default: [] 
//   },
//   created_at: { 
//     type: Date, 
//     default: Date.now 
//   },
//   updated_at: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // Update the updated_at timestamp before saving
// StudentSchema.pre('save', function(next) {
//   this.updated_at = Date.now();
//   next();
// });

// export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  first_name: { 
    type: String, 
    required: [true, 'First name is required'], 
    trim: true 
  },
  last_name: { 
    type: String, 
    required: [true, 'Last name is required'], 
    trim: true 
  },
  mail_id: { 
    type: String,
    unique: true,
    sparse: true, // Only index documents with a non-empty email.
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    trim: true 
  },
  address: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  date_of_birth: { 
    type: Date, 
    default: null 
  },
  education: { 
    type: String, 
    enum: ['masters', 'pg_diploma', ''], 
    default: '' 
  },
  box_cricket: { 
    type: Boolean, 
    default: false 
  },
  box_cricket_years: { 
    type: String, 
    default: '' 
  },
  atmiya_cricket_tournament: { 
    type: Boolean, 
    default: false 
  },
  atmiya_cricket_years: { 
    type: String, 
    default: '' 
  },
  atmiya_youth_shibir: { 
    type: Boolean, 
    default: false 
  },
  atmiya_youth_years: { 
    type: String, 
    default: '' 
  },
  yuva_mahotsav: { 
    type: Boolean, 
    default: false 
  },
  yuva_mahotsav_years: { 
    type: String, 
    default: '' 
  },
  harimay: { 
    type: Boolean, 
    default: false 
  },
  emergency_contact: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  notes: { 
    type: String, 
    trim: true, 
    default: '' 
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
StudentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
