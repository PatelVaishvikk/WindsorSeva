// // pages/add-yuvak.js
// import { useState } from 'react';
// import Head from 'next/head';
// import Link from 'next/link';
// import Navbar from '../components/Navbar';
// import { useRouter } from 'next/router';

// export default function AddYuvak() {
//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     mail_id: '',
//     phone: '',
//     address: '',
//     date_of_birth: '',
//     gender: '',
//     education: '',
//     interests: [],
//     emergency_contact: '',
//     profile_picture: null,
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [error, setError] = useState(null);
//   const [step, setStep] = useState(1);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const router = useRouter();

//   const interestOptions = [
//     'Sports', 'Music', 'Reading', 'Art', 'Technology',
//     'Science', 'Travel', 'Cooking', 'Photography', 'Dance'
//   ];

//   // Validate form data for each step
//   const validateForm = (currentStep) => {
//     const newErrors = {};
//     if (currentStep === 1) {
//       if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
//       if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
//       if (!formData.mail_id.trim()) {
//         newErrors.mail_id = 'Email is required';
//       } else if (!/\S+@\S+\.\S+/.test(formData.mail_id)) {
//         newErrors.mail_id = 'Please enter a valid email address';
//       }
//       if (!formData.phone.trim()) {
//         newErrors.phone = 'Phone number is required';
//       } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
//         newErrors.phone = 'Please enter a valid 10-digit phone number';
//       }
//     }
//     if (currentStep === 2) {
//       if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
//       if (!formData.gender) newErrors.gender = 'Please select a gender';
//     }
//     setError(Object.keys(newErrors).length > 0 ? Object.values(newErrors).join('\n') : null);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form field changes (including interests and file preview)
//   const handleChange = (e) => {
//     const { id, value, type, checked, files } = e.target;
//     if (type === 'file') {
//       const file = files[0];
//       if (file) {
//         setFormData(prev => ({ ...prev, profile_picture: file }));
//         const reader = new FileReader();
//         reader.onloadend = () => { setPreviewUrl(reader.result); };
//         reader.readAsDataURL(file);
//       }
//     } else if (type === 'checkbox') {
//       const updatedInterests = checked 
//         ? [...formData.interests, value] 
//         : formData.interests.filter(interest => interest !== value);
//       setFormData(prev => ({ ...prev, interests: updatedInterests }));
//     } else {
//       setFormData(prev => ({ ...prev, [id]: value }));
//     }
//     // Clear error for this field when user starts typing
//     if (error && error.includes(id)) {
//       setError(null);
//     }
//   };

//   // Handle multi-step navigation
//   const handleNextStep = () => {
//     if (validateForm(step)) {
//       setStep(prev => prev + 1);
//     }
//   };
//   const handlePrevStep = () => {
//     setStep(prev => prev - 1);
//   };

//   // Handle final form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     // Final validation of required fields
//     const requiredFields = ['first_name', 'last_name', 'mail_id', 'phone'];
//     const missingFields = requiredFields.filter(field => !formData[field]);
//     if (missingFields.length > 0) {
//       setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
//       setLoading(false);
//       return;
//     }

//     try {
//       // Make sure email is properly trimmed to avoid whitespace issues
//       const trimmedData = {
//         ...formData,
//         mail_id: formData.mail_id.trim(),
//         first_name: formData.first_name.trim(),
//         last_name: formData.last_name.trim(),
//         phone: formData.phone.trim()
//       };

//       // Debug logging
//       console.log("Submitting data to API:", JSON.stringify(trimmedData));

//       // Submit new student via API
//       const response = await fetch('/api/students', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           first_name: trimmedData.first_name,
//           last_name: trimmedData.last_name,
//           mail_id: trimmedData.mail_id,
//           phone: trimmedData.phone,
//           address: trimmedData.address || '',
//           date_of_birth: trimmedData.date_of_birth || null,
//           gender: trimmedData.gender || '',
//           education: trimmedData.education || '',
//           emergency_contact: trimmedData.emergency_contact || '',
//           interests: trimmedData.interests || [],
//           notes: trimmedData.notes || ''
//         }),
//       });
      
//       const result = await response.json();
      
//       // Enhanced error logging
//       console.log("API Response:", result);
//       console.log("Response status:", response.status);
      
//       if (!response.ok) {
//         if (result.error && result.error.includes('Email already exists')) {
//           // Log the exact error for debugging
//           console.error('Email duplicate error:', result);
          
//           // Show more detailed message
//           setError(`A student with email "${trimmedData.mail_id}" appears to already exist in the database. Please use a different email address.`);
//           setLoading(false);
//           return;
//         }
//         throw new Error(result.error || 'Failed to add student');
//       }
      
//       // Success - show toast and redirect
//       showToast('Success', 'Student added successfully', 'success');
//       router.push('/students-table');
//     } catch (err) {
//       console.error('Error adding student:', err);
//       setError(err.message || 'Failed to add student. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Display toast notification
//   const showToast = (title, message, type = 'success') => {
//     setToast({ title, message, type });
//     setTimeout(() => setToast(null), 5000);
//   };

//   // Render form content for the current step
//   const renderFormStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <>
//             <div className="row">
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">First Name <span className="text-danger">*</span></label>
//                 <div className="input-group">
//                   <span className="input-group-text"><i className="fas fa-user"></i></span>
//                   <input
//                     type="text"
//                     className={`form-control ${error && error.includes('First name') ? 'is-invalid' : ''}`}
//                     id="first_name"
//                     value={formData.first_name}
//                     onChange={handleChange}
//                     required
//                   />
//                   {error && error.includes('First name') && (
//                     <div className="invalid-feedback">{error}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Last Name <span className="text-danger">*</span></label>
//                 <div className="input-group">
//                   <span className="input-group-text"><i className="fas fa-user"></i></span>
//                   <input
//                     type="text"
//                     className={`form-control ${error && error.includes('Last name') ? 'is-invalid' : ''}`}
//                     id="last_name"
//                     value={formData.last_name}
//                     onChange={handleChange}
//                     required
//                   />
//                   {error && error.includes('Last name') && (
//                     <div className="invalid-feedback">{error}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Email <span className="text-danger">*</span></label>
//                 <div className="input-group">
//                   <span className="input-group-text"><i className="fas fa-envelope"></i></span>
//                   <input
//                     type="email"
//                     className={`form-control ${error && error.includes('Email') ? 'is-invalid' : ''}`}
//                     id="mail_id"
//                     value={formData.mail_id}
//                     onChange={handleChange}
//                     required
//                   />
//                   {error && error.includes('Email') && (
//                     <div className="invalid-feedback">{error}</div>
//                   )}
//                 </div>
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Phone <span className="text-danger">*</span></label>
//                 <div className="input-group">
//                   <span className="input-group-text"><i className="fas fa-phone"></i></span>
//                   <input
//                     type="tel"
//                     className={`form-control ${error && error.includes('Phone number') ? 'is-invalid' : ''}`}
//                     id="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     required
//                   />
//                   {error && error.includes('Phone number') && (
//                     <div className="invalid-feedback">{error}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </>
//         );
//       case 2:
//         return (
//           <>
//             <div className="row">
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
//                 <input
//                   type="date"
//                   className={`form-control ${error && error.includes('Date of birth') ? 'is-invalid' : ''}`}
//                   id="date_of_birth"
//                   value={formData.date_of_birth}
//                   onChange={handleChange}
//                   required
//                 />
//                 {error && error.includes('Date of birth') && (
//                   <div className="invalid-feedback">{error}</div>
//                 )}
//               </div>
//               <div className="col-md-6 mb-3">
//                 <label className="form-label">Gender <span className="text-danger">*</span></label>
//                 <select
//                   id="gender"
//                   className={`form-select ${error && error.includes('gender') ? 'is-invalid' : ''}`}
//                   value={formData.gender}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//                 {error && error.includes('gender') && (
//                   <div className="invalid-feedback">{error}</div>
//                 )}
//               </div>
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Education</label>
//               <select id="education" className="form-select" value={formData.education} onChange={handleChange}>
//                 <option value="">Select Education</option>
//                 <option value="high_school">High School</option>
//                 <option value="bachelors">Bachelors</option>
//                 <option value="masters">Masters</option>
//                 <option value="phd">PhD</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Interests</label>
//               <div className="row">
//                 {interestOptions.map((interest) => (
//                   <div className="col-6 col-md-4" key={interest}>
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         value={interest}
//                         id={`interest-${interest}`}
//                         checked={formData.interests.includes(interest)}
//                         onChange={handleChange}
//                       />
//                       <label className="form-check-label" htmlFor={`interest-${interest}`}>
//                         {interest}
//                       </label>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         );
//       case 3:
//         return (
//           <>
//             <div className="mb-3">
//               <label className="form-label">Profile Picture (Optional)</label>
//               <input className="form-control" type="file" id="profile_picture" onChange={handleChange} />
//               {previewUrl && (
//                 <div className="mt-3">
//                   <img src={previewUrl} alt="Profile Preview" className="img-thumbnail" style={{ maxWidth: '150px' }} />
//                 </div>
//               )}
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Emergency Contact</label>
//               <input
//                 type="tel"
//                 className="form-control"
//                 id="emergency_contact"
//                 value={formData.emergency_contact}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Notes</label>
//               <textarea
//                 className="form-control"
//                 id="notes"
//                 rows="3"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 placeholder="Additional notes or details"
//               />
//             </div>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Head>
//         <title>Add Student - HSAPSS Windsor</title>
//       </Head>

//       <Navbar />

//       <main className="main-content">
//         <div className="container mt-5">
//           <div className="card shadow">
//             <div className="card-header bg-primary text-white">
//               <h5 className="mb-0">
//                 <i className="fas fa-user-plus me-2"></i>Add New Student
//               </h5>
//               <div className="progress mt-3">
//                 <div 
//                   className="progress-bar" 
//                   role="progressbar" 
//                   style={{ width: `${(step / 3) * 100}%` }}
//                   aria-valuenow={(step / 3) * 100}
//                   aria-valuemin="0"
//                   aria-valuemax="100"
//                 ></div>
//               </div>
//               <div className="d-flex justify-content-between mt-2">
//                 <small>Step {step} of 3</small>
//                 <small>{step === 1 ? 'Basic Info' : step === 2 ? 'Personal Details' : 'Additional Info'}</small>
//               </div>
//             </div>
//             <div className="card-body">
//               <form onSubmit={handleSubmit} noValidate>
//                 {renderFormStep()}
//                 {error && (
//                   <div className="alert alert-danger mt-3" role="alert">
//                     {error}
//                   </div>
//                 )}
//                 <div className="d-flex justify-content-between mt-4">
//                   {step > 1 && (
//                     <button 
//                       type="button" 
//                       className="btn btn-outline-secondary" 
//                       onClick={handlePrevStep}
//                     >
//                       <i className="fas fa-arrow-left me-2"></i>
//                       Previous
//                     </button>
//                   )}
//                   {step < 3 ? (
//                     <button 
//                       type="button" 
//                       className="btn btn-primary ms-auto"
//                       onClick={handleNextStep}
//                     >
//                       Next
//                       <i className="fas fa-arrow-right ms-2"></i>
//                     </button>
//                   ) : (
//                     <button 
//                       type="submit" 
//                       className="btn btn-success ms-auto"
//                       disabled={loading}
//                     >
//                       {loading ? (
//                         <>
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                           Saving...
//                         </>
//                       ) : (
//                         <>
//                           <i className="fas fa-save me-2"></i>
//                           Save Student
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Toast Notification */}
//       {toast && (
//         <div className="toast-container position-fixed bottom-0 end-0 p-3">
//           <div 
//             className={`toast show align-items-center text-white bg-${toast.type} border-0`}
//             role="alert"
//             aria-live="assertive"
//             aria-atomic="true"
//             style={{
//               minWidth: '300px',
//               borderRadius: '10px',
//               boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//             }}
//           >
//             <div className="d-flex">
//               <div className="toast-body">
//                 <strong>{toast.title}</strong><br />
//                 {toast.message}
//               </div>
//               <button 
//                 type="button" 
//                 className="btn-close btn-close-white me-2 m-auto" 
//                 onClick={() => setToast(null)}
//                 aria-label="Close"
//               ></button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Debugging Information (remove in production) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="container mt-5 d-none">
//           <div className="card">
//             <div className="card-header bg-secondary text-white">
//               <h6 className="mb-0">Debug Information</h6>
//             </div>
//             <div className="card-body">
//               <pre>{JSON.stringify(formData, null, 2)}</pre>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// pages/add-yuvak.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

export default function AddYuvak() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mail_id: '',
    phone: '',
    address: '',
    date_of_birth: '',
    education: '',
    box_cricket: false,
    box_cricket_years: '',
    atmiya_cricket_tournament: false,
    atmiya_cricket_years: '',
    atmiya_youth_shibir: false,
    atmiya_youth_years: '',
    yuva_mahotsav: false,
    yuva_mahotsav_years: '',
    harimay: false,
    emergency_contact: '',
    profile_picture: null,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  // Validate form data for each step
  const validateForm = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.mail_id.trim()) {
        newErrors.mail_id = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.mail_id)) {
        newErrors.mail_id = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    if (currentStep === 2) {
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';

      // Validate event participation fields: if an event is checked, the years field is required
      if (formData.box_cricket && !formData.box_cricket_years.trim()) {
        newErrors.box_cricket_years = 'Please specify years for Box Cricket';
      }
      if (formData.atmiya_cricket_tournament && !formData.atmiya_cricket_years.trim()) {
        newErrors.atmiya_cricket_years = 'Please specify years for Atmiya Cricket Tournament';
      }
      if (formData.atmiya_youth_shibir && !formData.atmiya_youth_years.trim()) {
        newErrors.atmiya_youth_years = 'Please specify years for Atmiya Youth Shibir';
      }
      if (formData.yuva_mahotsav && !formData.yuva_mahotsav_years.trim()) {
        newErrors.yuva_mahotsav_years = 'Please specify years for Yuva Mahotsav (India)';
      }
    }
    setError(Object.keys(newErrors).length > 0 ? Object.values(newErrors).join('\n') : null);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes (including file preview and checkboxes)
  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, profile_picture: file }));
        const reader = new FileReader();
        reader.onloadend = () => { setPreviewUrl(reader.result); };
        reader.readAsDataURL(file);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [id]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
    // Clear error for this field when user starts typing
    if (error && error.includes(id)) {
      setError(null);
    }
  };

  // Handle multi-step navigation
  const handleNextStep = () => {
    if (validateForm(step)) {
      setStep(prev => prev + 1);
    }
  };
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Final validation of required fields
    const requiredFields = ['first_name', 'last_name', 'mail_id', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const trimmedData = {
        ...formData,
        mail_id: formData.mail_id.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim()
      };

      // Debug logging
      console.log("Submitting data to API:", JSON.stringify(trimmedData));

      // Submit new student via API
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: trimmedData.first_name,
          last_name: trimmedData.last_name,
          mail_id: trimmedData.mail_id,
          phone: trimmedData.phone,
          address: trimmedData.address || '',
          date_of_birth: trimmedData.date_of_birth || null,
          education: trimmedData.education || '',
          box_cricket: trimmedData.box_cricket,
          box_cricket_years: trimmedData.box_cricket ? trimmedData.box_cricket_years : '',
          atmiya_cricket_tournament: trimmedData.atmiya_cricket_tournament,
          atmiya_cricket_years: trimmedData.atmiya_cricket_tournament ? trimmedData.atmiya_cricket_years : '',
          atmiya_youth_shibir: trimmedData.atmiya_youth_shibir,
          atmiya_youth_years: trimmedData.atmiya_youth_shibir ? trimmedData.atmiya_youth_years : '',
          yuva_mahotsav: trimmedData.yuva_mahotsav,
          yuva_mahotsav_years: trimmedData.yuva_mahotsav ? trimmedData.yuva_mahotsav_years : '',
          harimay: trimmedData.harimay,
          emergency_contact: trimmedData.emergency_contact || '',
          notes: trimmedData.notes || ''
        }),
      });
      
      const result = await response.json();
      
      console.log("API Response:", result);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (result.error && result.error.includes('Email already exists')) {
          console.error('Email duplicate error:', result);
          setError(`A student with email "${trimmedData.mail_id}" appears to already exist in the database. Please use a different email address.`);
          setLoading(false);
          return;
        }
        throw new Error(result.error || 'Failed to add student');
      }
      
      // Success - show toast and redirect
      showToast('Success', 'Student added successfully', 'success');
      router.push('/students-table');
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.message || 'Failed to add student. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Display toast notification
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Render form content for the current step
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  First Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-user"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${error && error.includes('first_name') ? 'is-invalid' : ''}`}
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  {error && error.includes('first_name') && (
                    <div className="invalid-feedback">{error}</div>
                  )}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Last Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-user"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${error && error.includes('last_name') ? 'is-invalid' : ''}`}
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  {error && error.includes('last_name') && (
                    <div className="invalid-feedback">{error}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control ${error && error.includes('Email') ? 'is-invalid' : ''}`}
                    id="mail_id"
                    value={formData.mail_id}
                    onChange={handleChange}
                    required
                  />
                  {error && error.includes('Email') && (
                    <div className="invalid-feedback">{error}</div>
                  )}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Phone <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-phone"></i>
                  </span>
                  <input
                    type="tel"
                    className={`form-control ${error && error.includes('Phone') ? 'is-invalid' : ''}`}
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {error && error.includes('Phone') && (
                    <div className="invalid-feedback">{error}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${error && error.includes('date_of_birth') ? 'is-invalid' : ''}`}
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
                {error && error.includes('date_of_birth') && (
                  <div className="invalid-feedback">{error}</div>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Education</label>
              <select
                id="education"
                className="form-select"
                value={formData.education}
                onChange={handleChange}
              >
                <option value="">Select Education</option>
                <option value="masters">Masters</option>
                <option value="pg_diploma">PG Diploma</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Events Participation</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="box_cricket"
                  checked={formData.box_cricket}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="box_cricket">
                  Box Cricket
                </label>
                {formData.box_cricket && (
                  <input
                    type="number"
                    className={`form-control mt-2 ${error && error.includes('box_cricket_years') ? 'is-invalid' : ''}`}
                    id="box_cricket_years"
                    placeholder="Years of participation"
                    value={formData.box_cricket_years}
                    onChange={handleChange}
                  />
                )}
              </div>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="atmiya_cricket_tournament"
                  checked={formData.atmiya_cricket_tournament}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="atmiya_cricket_tournament">
                  Atmiya Cricket Tournament
                </label>
                {formData.atmiya_cricket_tournament && (
                  <input
                    type="number"
                    className={`form-control mt-2 ${error && error.includes('atmiya_cricket_years') ? 'is-invalid' : ''}`}
                    id="atmiya_cricket_years"
                    placeholder="Years of participation"
                    value={formData.atmiya_cricket_years}
                    onChange={handleChange}
                  />
                )}
              </div>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="atmiya_youth_shibir"
                  checked={formData.atmiya_youth_shibir}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="atmiya_youth_shibir">
                  Atmiya Youth Shibir
                </label>
                {formData.atmiya_youth_shibir && (
                  <input
                    type="number"
                    className={`form-control mt-2 ${error && error.includes('atmiya_youth_years') ? 'is-invalid' : ''}`}
                    id="atmiya_youth_years"
                    placeholder="Years of participation"
                    value={formData.atmiya_youth_years}
                    onChange={handleChange}
                  />
                )}
              </div>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="yuva_mahotsav"
                  checked={formData.yuva_mahotsav}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="yuva_mahotsav">
                  Yuva Mahotsav (India)
                </label>
                {formData.yuva_mahotsav && (
                  <input
                    type="number"
                    className={`form-control mt-2 ${error && error.includes('yuva_mahotsav_years') ? 'is-invalid' : ''}`}
                    id="yuva_mahotsav_years"
                    placeholder="Years of participation"
                    value={formData.yuva_mahotsav_years}
                    onChange={handleChange}
                  />
                )}
              </div>
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="harimay"
                  checked={formData.harimay}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="harimay">
                  Harimay
                </label>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Profile Picture (Optional)</label>
              <input className="form-control" type="file" id="profile_picture" onChange={handleChange} />
              {previewUrl && (
                <div className="mt-3">
                  <img src={previewUrl} alt="Profile Preview" className="img-thumbnail" style={{ maxWidth: '150px' }} />
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Emergency Contact</label>
              <input
                type="tel"
                className="form-control"
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                id="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or details"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Add Student - HSAPSS Windsor</title>
      </Head>

      <Navbar />

      <main className="main-content">
        <div className="container mt-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>Add New Student
              </h5>
              <div className="progress mt-3">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${(step / 3) * 100}%` }}
                  aria-valuenow={(step / 3) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small>Step {step} of 3</small>
                <small>{step === 1 ? 'Basic Info' : step === 2 ? 'Personal Details' : 'Additional Info'}</small>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                {renderFormStep()}
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handlePrevStep}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Previous
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary ms-auto"
                      onClick={handleNextStep}
                    >
                      Next
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success ms-auto"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Student
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div
            className={`toast show align-items-center text-white bg-${toast.type} border-0`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{
              minWidth: '300px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <div className="d-flex">
              <div className="toast-body">
                <strong>{toast.title}</strong>
                <br />
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Debugging Information (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="container mt-5 d-none">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">Debug Information</h6>
            </div>
            <div className="card-body">
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
