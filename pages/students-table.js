// import { useState, useEffect, useCallback, useMemo } from 'react'; // <--- Added useMemo here
// // Import necessary components from react-bootstrap
// import { Modal, Button, Form, Badge, Toast, Row, Col, InputGroup, Spinner, DropdownButton, Dropdown, Container } from 'react-bootstrap';
// import dynamic from 'next/dynamic';
// import Navbar from '../components/Navbar'; // Verify path
// import Head from 'next/head';
// import { debounce } from 'lodash';

// // Dynamically import DataTable for client-side rendering
// const DataTable = dynamic(() => import('react-data-table-component').then(mod => mod.default), {
//   ssr: false, // Ensure it only renders on the client
//   loading: () => ( // Custom loading indicator while the component loads
//     <div className="text-center py-5">
//       <Spinner animation="border" variant="primary" role="status">
//         <span className="visually-hidden">Loading Table Component...</span>
//       </Spinner>
//       <div className="mt-2 text-muted">Loading Table Component...</div>
//     </div>
//   )
// });

// // Helper to generate a consistent color for avatars based on name/id
// const stringToColor = (str) => {
//   if (!str) return '#e0e0e0'; // Default grey
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     hash = hash & hash; // Convert to 32bit integer
//   }
//   const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
//   return '#' + '00000'.substring(0, 6 - color.length) + color;
// };

// // --- Custom Styles for DataTable (Optional: Fine-tune appearance) ---
// const customTableStyles = {
// 	headCells: {
// 		style: {
//             fontSize: '0.85rem', // Slightly smaller header text
//             fontWeight: 'bold',
//             color: '#495057', // Bootstrap muted text color
//             paddingLeft: '12px', // Adjust padding
//             paddingRight: '12px',
// 		},
// 	},
// 	cells: {
// 		style: {
//             paddingLeft: '12px', // Consistent padding
//             paddingRight: '12px',
//             paddingTop: '10px', // Increase padding slightly for touch
//             paddingBottom: '10px',
//             minHeight: '55px', // Ensure cells have enough height
//             lineHeight: '1.4', // Improve readability
// 		},
// 	},
//     // Style for responsive stacked layout
//     rows: {
//         style: {
//             // Ensure rows don't get too squished when stacked
//             '@media (max-width: 768px)': {
//                  minHeight: '65px', // Slightly more height on mobile
//                  padding: '12px 0', // Add vertical padding when stacked
//                  borderBottom: '1px solid #dee2e6', // Add separator when stacked
//             },
//             '&:last-of-type': { // Remove border from last row when stacked
//                 '@media (max-width: 768px)': {
//                     borderBottom: 'none',
//                 }
//             }
//         },
//          // Highlight row slightly on hover for better visual feedback
//         highlightOnHoverStyle: {
//             backgroundColor: 'rgba(0, 123, 255, 0.05)',
//             // transitionDuration: '0.15s',
//             // transitionProperty: 'background-color', // Optional: smoother transition
//         },
//     },
//     pagination: {
//         style: {
//             borderTop: 'none', // Remove default top border if card has border
//             fontSize: '0.8rem', // Smaller pagination text
//             padding: '5px', // Reduce padding
//         },
//         pageButtonsStyle: {
//             // Style pagination buttons for touch
//             borderRadius: '50%',
//             height: '35px',
//             width: '35px',
//             padding: '5px',
//             margin: '2px',
//             cursor: 'pointer',
//             transition: '0.2s',
//             '&:disabled': {
// 				cursor: 'unset',
// 				color: '#adb5bd', // Muted color for disabled
// 				fill: '#adb5bd',
// 			},
// 			'&:hover:not(:disabled)': {
// 				backgroundColor: 'rgba(0, 123, 255, 0.1)', // Subtle hover
// 			},
// 			'&:focus': {
// 				outline: 'none',
// 				boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.3)', // Focus ring
// 			},
//         }
//     },
// };


// export default function StudentsTable() {
//   // State variables (same as before)
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [totalRows, setTotalRows] = useState(0);
//   const [perPage, setPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showCallLogModal, setShowCallLogModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastInfo, setToastInfo] = useState({ message: '', variant: 'success' });
//   const [editForm, setEditForm] = useState({});
//   const [callLog, setCallLog] = useState({});
//   const [mounted, setMounted] = useState(false);
//   const [isSavingEdit, setIsSavingEdit] = useState(false);
//   const [isSavingCallLog, setIsSavingCallLog] = useState(false);

//   // --- API Interaction (using useCallback) ---
//   const fetchStudents = useCallback(async (page = 1, limit = perPage, search = searchTerm) => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams({
//         page: page.toString(),
//         limit: limit.toString(),
//         ...(search && { search: search.trim() })
//       }).toString();

//       const response = await fetch(`/api/students?${query}`);
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || `Failed to fetch students (Status: ${response.status})`);
//       }
//       setStudents(data.students || []);
//       setTotalRows(data.total || 0);
//     } catch (error) {
//       console.error('Error fetching students:', error);
//       showToastMessage(error.message, 'danger');
//       setStudents([]);
//       setTotalRows(0);
//     } finally {
//       setLoading(false);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [perPage]); // Dependency on perPage

//   // --- Event Handlers (using useCallback where appropriate) ---
//   const showToastMessage = useCallback((message, variant = 'success') => {
//     setToastInfo({ message, variant });
//     setShowToast(true);
//   }, []);

//   // Debounced search handler
//   const debouncedFetch = useCallback(debounce((page, limit, term) => {
//     fetchStudents(page, limit, term);
//   }, 500), [fetchStudents]);

//   const handleSearchChange = useCallback((e) => {
//     const term = e.target.value;
//     setSearchTerm(term);
//     setCurrentPage(1); // Reset page on new search
//     debouncedFetch(1, perPage, term.trim());
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedFetch, perPage]);

//   const clearSearch = useCallback(() => {
//     setSearchTerm('');
//     setCurrentPage(1);
//     fetchStudents(1, perPage, '');
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [fetchStudents, perPage]);


//   const handlePageChange = useCallback(page => {
//     setCurrentPage(page);
//     fetchStudents(page, perPage, searchTerm.trim());
//   }, [fetchStudents, perPage, searchTerm]);

//   const handlePerRowsChange = useCallback(async (newPerPage, page) => {
//     setPerPage(newPerPage);
//     setCurrentPage(1);
//     fetchStudents(1, newPerPage, searchTerm.trim());
//   }, [fetchStudents, searchTerm]);

//   // Effect to fetch data on mount and track mount status
//   useEffect(() => {
//     setMounted(true);
//     fetchStudents(1, 10, ''); // Initial fetch
//      // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Run only once on mount

//   const handleEdit = useCallback((student) => {
//     setSelectedStudent(student);
//     setEditForm({
//       first_name: student.first_name || '',
//       last_name: student.last_name || '',
//       mail_id: student.mail_id || '',
//       phone: student.phone || '',
//       address: student.address || '',
//       date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
//       gender: student.gender || '',
//       education: student.education || '',
//       emergency_contact: student.emergency_contact || '',
//       notes: student.notes || ''
//     });
//     setShowEditModal(true);
//   }, []);

//   const saveEditChanges = useCallback(async () => {
//     if (!selectedStudent?._id) return;
//     setIsSavingEdit(true);
//     try {
//       const response = await fetch(`/api/students?id=${selectedStudent._id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editForm),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to update student');
//       }
//       setShowEditModal(false);
//       showToastMessage('Student updated successfully', 'success');
//       fetchStudents(currentPage, perPage, searchTerm.trim()); // Refetch current page
//     } catch (error) {
//       console.error('Error updating student:', error);
//       showToastMessage(error.message, 'danger');
//     } finally {
//       setIsSavingEdit(false);
//     }
//   }, [selectedStudent, editForm, showToastMessage, fetchStudents, currentPage, perPage, searchTerm]);

//   const handleDelete = useCallback(async (studentId, studentName) => {
//      if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
//          return;
//      }
//     try {
//       const response = await fetch(`/api/students?id=${studentId}`, { method: 'DELETE' });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to delete student');
//       }
//       showToastMessage(`Student ${studentName} deleted successfully`, 'success');
//        const newTotalRows = totalRows - 1;
//       if (students.length === 1 && currentPage > 1) {
//             const prevPage = currentPage - 1;
//             setCurrentPage(prevPage);
//             fetchStudents(prevPage, perPage, searchTerm.trim());
//       } else {
//           setTotalRows(newTotalRows); // Update total rows locally
//           // Fetch current page data, RDT should adjust if page is now empty > page 1
//           fetchStudents(currentPage, perPage, searchTerm.trim());
//       }
//     } catch (error) {
//       console.error('Error deleting student:', error);
//       showToastMessage(error.message, 'danger');
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showToastMessage, totalRows, students.length, currentPage, fetchStudents, perPage, searchTerm]);

//   const handleAddCallLog = useCallback((student) => {
//     if (!student) return;
//     setSelectedStudent(student);
//     setCallLog({ status: 'Completed', notes: '', needs_follow_up: false, follow_up_date: '' });
//     setShowCallLogModal(true);
//   }, []);

//   const saveCallLog = useCallback(async () => {
//     if (!selectedStudent?._id) return;
//     if (callLog.needs_follow_up && !callLog.follow_up_date) {
//         showToastMessage('Please provide a follow-up date.', 'danger');
//         return;
//     }
//     setIsSavingCallLog(true);
//     try {
//       const response = await fetch('/api/call-logs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ student_id: selectedStudent._id, ...callLog }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to save call log');
//       }
//       setShowCallLogModal(false);
//       showToastMessage('Call log added successfully', 'success');
//     } catch (error) {
//       console.error('Error saving call log:', error);
//       showToastMessage(error.message, 'danger');
//     } finally {
//       setIsSavingCallLog(false);
//     }
//   }, [selectedStudent, callLog, showToastMessage]);

//   // --- Table Columns Definition (Mobile Focus) ---
//   // Using useMemo to memoize columns based on handlers
//   const columns = useMemo(() => [             // <--- Removed React. prefix
//     {
//       name: 'Student & Contact', // Changed column name
//       selector: row => `${row.first_name || ''} ${row.last_name || ''}`,
//       sortable: true,
//       grow: 3, // Give this combined cell more space
//       minWidth: '250px', // Ensure minimum space for combined info
//       cell: row => {
//         const name = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A';
//         const initial = row.first_name ? row.first_name[0].toUpperCase() : '?';
//         const avatarColor = stringToColor(row._id || name);

//         return (
//           <div className="d-flex align-items-center py-1 w-100">
//             {/* Avatar */}
//             <div
//               className="avatar-circle me-3 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
//               style={{
//                 width: '40px', height: '40px', borderRadius: '50%',
//                 backgroundColor: avatarColor, fontSize: '1rem'
//               }}
//               title={name}
//             >
//               {initial}
//             </div>
//             {/* Info Block */}
//             <div className="flex-grow-1" style={{ lineHeight: '1.4' }}>
//               {/* Name */}
//               <div className="fw-bold text-truncate">{name}</div>
//               {/* Phone (Clickable) - PRIORITIZED */}
//               <div className="small mt-1">
//                 {row.phone ? (
//                   <a href={`tel:${row.phone}`} className="text-decoration-none d-inline-flex align-items-center text-primary fw-medium"> {/* More prominent */}
//                      <i className="fas fa-mobile-alt me-1 opacity-75"></i>
//                     {row.phone}
//                   </a>
//                 ) : (
//                   <span className="text-muted fst-italic d-inline-flex align-items-center">
//                      <i className="fas fa-mobile-alt me-1 text-muted"></i> N/A
//                   </span>
//                 )}
//               </div>
//               {/* Email (Clickable) - Secondary */}
//               <div className="text-muted small mt-1" style={{ wordBreak: 'break-all' }}>
//                 {row.mail_id ? (
//                   <a href={`mailto:${row.mail_id}`} className="text-decoration-none text-muted d-inline-flex align-items-center">
//                     <i className="fas fa-envelope me-1 opacity-75 small"></i>
//                     {row.mail_id}
//                   </a>
//                 ) : (
//                    <span className='fst-italic d-inline-flex align-items-center'>
//                       <i className="fas fa-envelope me-1 text-muted small"></i> No email
//                    </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       name: 'Education',
//       selector: row => row.education,
//       sortable: true,
//       minWidth: '120px',
//       grow: 1, // Less space priority
//       // This will be stacked automatically on small screens by RDT 'responsive'
//       cell: row => (
//         row.education ? (
//           <Badge bg="light" text="dark" className="border small fw-normal text-truncate" style={{maxWidth: '150px'}}> {/* Truncate badge */}
//             {(row.education || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//           </Badge>
//         ) : (
//            <span className="text-muted fst-italic small">N/A</span>
//         )
//       ),
//     },
//     {
//       name: 'Actions',
//       button: true,
//       allowOverflow: true,
//       minWidth: '80px', // Reduce width further, icon only title helps
//       grow: 0, // Don't allow actions to grow
//       cell: row => (
//          <DropdownButton
//             // Title is just the icon for extreme compactness
//             title={<i className="fas fa-ellipsis-v"></i>}
//             size="sm"
//             variant="outline-secondary" // Subtle outline
//             drop="start" // Drop left
//             className="py-0" // Reduce padding on the button itself
//          >
//           <Dropdown.Item onClick={() => handleAddCallLog(row)}>
//              <i className="fas fa-phone-alt text-success me-2 fa-fw"></i>Add Call Log
//           </Dropdown.Item>
//           <Dropdown.Item onClick={() => handleEdit(row)}>
//             <i className="fas fa-edit text-primary me-2 fa-fw"></i>Edit Student
//           </Dropdown.Item>
//           <Dropdown.Divider />
//           <Dropdown.Item
//              className="text-danger"
//              onClick={() => handleDelete(row._id, `${row.first_name || ''} ${row.last_name || ''}`.trim())}
//            >
//              <i className="fas fa-trash me-2 fa-fw"></i>Delete Student
//           </Dropdown.Item>
//         </DropdownButton>
//       ),
//     },
//   ], [handleEdit, handleDelete, handleAddCallLog]); // Dependencies for handlers used in columns

//   // --- JSX Render ---
//   return (
//     <>
//       <Head>
//         <title>Students - HSAPSS Windsor</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
//               integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
//               crossOrigin="anonymous" referrerPolicy="no-referrer" />
//       </Head>

//       <Navbar />

//       <Container fluid className="py-3 px-sm-3 px-md-4">
//         {/* Page Header */}
//         <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-3 mb-md-4 gap-2">
//           <h1 className="h3 mb-0 text-center text-md-start">Manage Students</h1>
//           <div className="d-grid d-md-block">
//             <Button variant="success" href="/add-student" as="a" size="sm">
//                 <i className="fas fa-user-plus me-2"></i>Add New Student
//             </Button>
//           </div>
//         </div>

//         {/* Main Content Card */}
//         <div className="card shadow-sm">
//           <div className="card-header bg-light py-2 px-3">
//              <Row className="gy-2 align-items-center">
//                   <Col xs={12} md="auto">
//                       <h5 className="mb-0 text-muted small fw-bold">Student Records</h5>
//                   </Col>
//                   <Col xs={12} md={6} lg={5} xl={4}>
//                      <InputGroup size="sm">
//                          <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
//                          <Form.Control
//                             type="search"
//                             placeholder="Search..."
//                             value={searchTerm}
//                             onChange={handleSearchChange}
//                             aria-label="Search Students"
//                          />
//                          {searchTerm && (
//                             <Button variant="outline-secondary" onClick={clearSearch} title="Clear Search" size="sm">
//                                 <i className="fas fa-times"></i>
//                             </Button>
//                          )}
//                      </InputGroup>
//                  </Col>
//              </Row>
//           </div>
//           <div className="card-body p-0">
//             {/* Conditionally render DataTable only after mount */}
//             {mounted ? (
//               <div className="table-container"> {/* Added a container div */}
//                 <DataTable
//                   columns={columns}
//                   data={students}
//                   progressPending={loading}
//                    progressComponent={
//                       <div className="text-center py-5">
//                           <Spinner animation="border" variant="primary"/>
//                           <p className="mt-2 mb-0 text-muted small">Loading Students...</p>
//                       </div>
//                    }
//                   pagination
//                   paginationServer
//                   paginationTotalRows={totalRows}
//                   onChangeRowsPerPage={handlePerRowsChange}
//                   onChangePage={handlePageChange}
//                   paginationPerPage={perPage}
//                   paginationRowsPerPageOptions={[10, 25, 50]}
//                   highlightOnHover // Kept highlight on hover
//                   // pointerOnHover // Can be distracting on mobile, consider removing if highlight is enough
//                   // --- Key Mobile Improvements ---
//                   responsive // Enable RDT's responsive stacking
//                   dense // Make rows more compact
//                   customStyles={customTableStyles} // Apply custom styles
//                    noDataComponent={
//                       <div className="text-center p-4">
//                           <i className="fas fa-users-slash fa-2x text-muted mb-2"></i>
//                           <h6 className="text-muted">No Students Found</h6>
//                           <p className="text-muted small mb-0">
//                               {searchTerm ? `No results for "${searchTerm}".` : 'Add students to see them here.'}
//                           </p>
//                       </div>
//                    }
//                 />
//               </div>
//             ) : (
//                 // Basic loading state before client mount
//                 <div className="text-center p-5">
//                      <Spinner animation="border" variant="secondary" size="sm"/>
//                      <p className="mt-2 mb-0 text-muted small">Initializing Table...</p>
//                 </div>
//             )}
//           </div>
//            {/* Optional Footer */}
//             <div className="card-footer text-muted text-end small py-1 px-3 d-none d-md-block">
//                 Showing {students.length > totalRows ? totalRows : students.length} of {totalRows} students
//              </div>
//         </div>
//       </Container>

//       {/* --- Modals (Keep Mobile Optimizations from previous step) --- */}

//       {/* Edit Student Modal */}
//       <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static" scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title className="h6">
//               <i className="fas fa-user-edit me-2"></i>
//               Edit: {selectedStudent?.first_name} {selectedStudent?.last_name}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="py-3 px-4">
//           {selectedStudent && (
//             <Form id="editStudentForm" onSubmit={(e) => { e.preventDefault(); saveEditChanges(); }}>
//               <Row className="mb-3">
//                 <Form.Group as={Col} xs={12} md={6} controlId="editFirstName">
//                   <Form.Label className="small mb-1">First Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control size="sm" type="text" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} required />
//                 </Form.Group>
//                 <Form.Group as={Col} xs={12} md={6} controlId="editLastName" className="mt-2 mt-md-0">
//                   <Form.Label className="small mb-1">Last Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control size="sm" type="text" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} required />
//                 </Form.Group>
//               </Row>
//               <Row className="mb-3">
//                 <Form.Group as={Col} xs={12} md={6} controlId="editEmail">
//                   <Form.Label className="small mb-1">Email <span className="text-danger">*</span></Form.Label>
//                   <Form.Control size="sm" type="email" placeholder="student@example.com" value={editForm.mail_id} onChange={(e) => setEditForm({ ...editForm, mail_id: e.target.value })} required />
//                 </Form.Group>
//                 <Form.Group as={Col} xs={12} md={6} controlId="editPhone" className="mt-2 mt-md-0">
//                   <Form.Label className="small mb-1">Phone <span className="text-danger">*</span></Form.Label>
//                   <Form.Control size="sm" type="tel" placeholder="+1-555-123-4567" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
//                 </Form.Group>
//               </Row>
//               <Form.Group className="mb-3" controlId="editAddress">
//                 <Form.Label className="small mb-1">Address</Form.Label>
//                 <Form.Control size="sm" type="text" placeholder="123 Main St..." value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
//               </Form.Group>
//               <Row className="mb-3">
//                 <Form.Group as={Col} xs={12} md={6} controlId="editDob">
//                     <Form.Label className="small mb-1">Date of Birth</Form.Label>
//                     <Form.Control size="sm" type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
//                 </Form.Group>
//                 <Form.Group as={Col} xs={12} md={6} controlId="editGender" className="mt-2 mt-md-0">
//                     <Form.Label className="small mb-1">Gender</Form.Label>
//                     <Form.Select size="sm" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
//                         <option value="">-- Select --</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         <option value="other">Other</option>
//                         <option value="prefer_not_to_say">Prefer not to say</option>
//                     </Form.Select>
//                 </Form.Group>
//               </Row>
//               <Form.Group className="mb-3" controlId="editEducation">
//                   <Form.Label className="small mb-1">Education</Form.Label>
//                   <Form.Control size="sm" type="text" placeholder="e.g., High School Diploma, BSc Comp Sci" value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })} />
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="editEmergencyContact">
//                   <Form.Label className="small mb-1">Emergency Contact</Form.Label>
//                   <Form.Control size="sm" type="text" placeholder="Name - Phone (e.g., Jane Doe - 555-987-6543)" value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} />
//               </Form.Group>
//               <Form.Group className="mb-2" controlId="editNotes">
//                 <Form.Label className="small mb-1">Notes</Form.Label>
//                 <Form.Control size="sm" as="textarea" rows={3} placeholder="Additional notes..." value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
//               </Form.Group>
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="px-3 py-2">
//           <Button variant="outline-secondary" size="sm" onClick={() => setShowEditModal(false)} disabled={isSavingEdit}>
//             Cancel
//           </Button>
//           <Button variant="primary" size="sm" type="submit" form="editStudentForm" disabled={isSavingEdit || !selectedStudent}>
//             {isSavingEdit ? (
//               <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</>
//             ) : (
//               <><i className="fas fa-save me-1"></i> Save</>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Add Call Log Modal */}
//       <Modal show={showCallLogModal} onHide={() => setShowCallLogModal(false)} centered backdrop="static" scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title className="h6"><i className="fas fa-phone-alt me-2"></i>Add Call Log</Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="py-3 px-4">
//           {selectedStudent && (
//             <Form id="callLogForm" onSubmit={(e) => { e.preventDefault(); saveCallLog(); }}>
//               <Form.Group className="mb-3">
//                 <Form.Label className="small mb-1">Student</Form.Label>
//                 <Form.Control size="sm" type="text" readOnly disabled value={`${selectedStudent.first_name} ${selectedStudent.last_name}`} />
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="callLogStatus">
//                 <Form.Label className="small mb-1">Status <span className="text-danger">*</span></Form.Label>
//                 <Form.Select size="sm" value={callLog.status} onChange={(e) => setCallLog({ ...callLog, status: e.target.value })} required >
//                   <option value="Completed">Completed</option>
//                   <option value="No Answer">No Answer</option>
//                   <option value="Left Message">Left Message</option>
//                   <option value="Follow-up Required">Follow-up Required</option>
//                   <option value="Wrong Number">Wrong Number</option>
//                 </Form.Select>
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="callLogNotes">
//                 <Form.Label className="small mb-1">Notes</Form.Label>
//                 <Form.Control size="sm" as="textarea" rows={3} placeholder="Details about the call..." value={callLog.notes} onChange={(e) => setCallLog({ ...callLog, notes: e.target.value })} />
//               </Form.Group>
//               <Form.Check
//                 type="checkbox"
//                 id="needsFollowUpCheck"
//                 label={<span className="small">Needs Follow-up?</span>}
//                 checked={callLog.needs_follow_up}
//                 onChange={(e) => setCallLog({ ...callLog, needs_follow_up: e.target.checked, follow_up_date: e.target.checked ? callLog.follow_up_date : '' })}
//                 className="mb-2"
//                 />
//               {callLog.needs_follow_up && (
//                 <Form.Group controlId="followUpDate" className="mb-2">
//                     <Form.Label className="small mb-1">Follow-up Date <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                         size="sm"
//                         type="date"
//                         value={callLog.follow_up_date}
//                         onChange={(e) => setCallLog({ ...callLog, follow_up_date: e.target.value })}
//                         required={callLog.needs_follow_up}
//                         min={new Date().toISOString().split('T')[0]}
//                         />
//                 </Form.Group>
//               )}
//             </Form>
//           )}
//         </Modal.Body>
//         <Modal.Footer className="px-3 py-2">
//           <Button variant="outline-secondary" size="sm" onClick={() => setShowCallLogModal(false)} disabled={isSavingCallLog}>
//             Cancel
//           </Button>
//           <Button variant="primary" size="sm" type="submit" form="callLogForm" disabled={isSavingCallLog || !selectedStudent}>
//             {isSavingCallLog ? (
//               <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</>
//             ) : (
//               <><i className="fas fa-save me-1"></i> Save Log</>
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>


//       {/* --- Toast Notification --- */}
//       <div
//         aria-live="polite"
//         aria-atomic="true"
//         className="position-fixed bottom-0 start-50 start-md-auto end-md-0 translate-middle-x p-3 p-md-3"
//         style={{ zIndex: 1150, width: 'auto', minWidth: '250px', maxWidth: '90%' }}
//        >
//             <Toast
//                 onClose={() => setShowToast(false)}
//                 show={showToast}
//                 delay={3500}
//                 autohide
//                 bg={toastInfo.variant.toLowerCase()}
//                 className="d-flex align-items-center text-white shadow rounded"
//             >
//                  <div className="toast-body d-flex align-items-center small p-2">
//                     {toastInfo.variant === 'success' && <i className="fas fa-check-circle me-2"></i>}
//                     {toastInfo.variant === 'danger' && <i className="fas fa-exclamation-triangle me-2"></i>}
//                     {toastInfo.message}
//                  </div>
//                   <Button
//                     onClick={() => setShowToast(false)}
//                     variant={null}
//                     className="btn-close btn-close-white me-2 m-auto p-1"
//                     aria-label="Close"
//                  ></Button>
//              </Toast>
//         </div>

//        {/* Add some basic CSS for RDT adjustments if needed */}
//        <style jsx global>{`
//             /* Style the stacked data labels for better readability */
//             .rdt_TableRow > div[data-column-id] {
//                  font-size: 0.9rem;
//             }
//             .rdt_TableRow > div[data-column-id] .rdt_ExpanderButton + div > div {
//                 font-weight: 500; /* Make the stacked data slightly bolder */
//                 margin-bottom: 2px;
//             }
//              /* Make the "Actions" dropdown slightly more touch-friendly */
//              .rdt_TableCell .dropdown-toggle {
//                  padding: 0.25rem 0.5rem; /* Adjust padding */
//              }

//              /* Ensure table container allows horizontal scroll if absolutely needed */
//              .table-container {
//                  overflow-x: auto;
//              }
//        `}</style>
//     </>
//   );
// }

import { useState, useEffect, useCallback, useMemo } from 'react'; // <--- Added useMemo here
// Import necessary components from react-bootstrap
import { Modal, Button, Form, Badge, Toast, Row, Col, InputGroup, Spinner, DropdownButton, Dropdown, Container } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar'; // Verify path
import Head from 'next/head';
import { debounce } from 'lodash';

// Dynamically import DataTable for client-side rendering
const DataTable = dynamic(() => import('react-data-table-component').then(mod => mod.default), {
  ssr: false, // Ensure it only renders on the client
  loading: () => ( // Custom loading indicator while the component loads
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading Table Component...</span>
      </Spinner>
      <div className="mt-2 text-muted">Loading Table Component...</div>
    </div>
  )
});

// Helper to generate a consistent color for avatars based on name/id
const stringToColor = (str) => {
  if (!str) return '#e0e0e0'; // Default grey
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - color.length) + color;
};

// --- Custom Styles for DataTable (Optional: Fine-tune appearance) ---
const customTableStyles = {
  headCells: {
    style: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
      color: '#495057',
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  cells: {
    style: {
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingTop: '10px',
      paddingBottom: '10px',
      minHeight: '55px',
      lineHeight: '1.4',
    },
  },
  rows: {
    style: {
      '@media (max-width: 768px)': {
        minHeight: '65px',
        padding: '12px 0',
        borderBottom: '1px solid #dee2e6',
      },
      '&:last-of-type': {
        '@media (max-width: 768px)': {
          borderBottom: 'none',
        }
      }
    },
    highlightOnHoverStyle: {
      backgroundColor: 'rgba(0, 123, 255, 0.05)',
    },
  },
  pagination: {
    style: {
      borderTop: 'none',
      fontSize: '0.8rem',
      padding: '5px',
    },
    pageButtonsStyle: {
      borderRadius: '50%',
      height: '35px',
      width: '35px',
      padding: '5px',
      margin: '2px',
      cursor: 'pointer',
      transition: '0.2s',
      '&:disabled': {
        cursor: 'unset',
        color: '#adb5bd',
        fill: '#adb5bd',
      },
      '&:hover:not(:disabled)': {
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
      },
      '&:focus': {
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.3)',
      },
    }
  },
};

export default function StudentsTable() {
  // State variables
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false); // New state for viewing details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState({ message: '', variant: 'success' });
  const [editForm, setEditForm] = useState({});
  const [callLog, setCallLog] = useState({});
  const [mounted, setMounted] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingCallLog, setIsSavingCallLog] = useState(false);

  // --- API Interaction (using useCallback) ---
  const fetchStudents = useCallback(async (page = 1, limit = perPage, search = searchTerm) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search: search.trim() })
      }).toString();

      const response = await fetch(`/api/students?${query}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch students (Status: ${response.status})`);
      }
      setStudents(data.students || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      console.error('Error fetching students:', error);
      showToastMessage(error.message, 'danger');
      setStudents([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  // --- Event Handlers (using useCallback where appropriate) ---
  const showToastMessage = useCallback((message, variant = 'success') => {
    setToastInfo({ message, variant });
    setShowToast(true);
  }, []);

  // Debounced search handler
  const debouncedFetch = useCallback(debounce((page, limit, term) => {
    fetchStudents(page, limit, term);
  }, 500), [fetchStudents]);

  const handleSearchChange = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    debouncedFetch(1, perPage, term.trim());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFetch, perPage]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchStudents(1, perPage, '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStudents, perPage]);

  const handlePageChange = useCallback(page => {
    setCurrentPage(page);
    fetchStudents(page, perPage, searchTerm.trim());
  }, [fetchStudents, perPage, searchTerm]);

  const handlePerRowsChange = useCallback(async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchStudents(1, newPerPage, searchTerm.trim());
  }, [fetchStudents, searchTerm]);

  // Effect to fetch data on mount and track mount status
  useEffect(() => {
    setMounted(true);
    fetchStudents(1, 10, '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Updated handleEdit to include new fields (and remove gender)
  const handleEdit = useCallback((student) => {
    setSelectedStudent(student);
    setEditForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      mail_id: student.mail_id || '',
      phone: student.phone || '',
      address: student.address || '',
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
      education: student.education || '',
      emergency_contact: student.emergency_contact || '',
      notes: student.notes || '',
      box_cricket: student.box_cricket || false,
      box_cricket_years: student.box_cricket_years || '',
      atmiya_cricket_tournament: student.atmiya_cricket_tournament || false,
      atmiya_cricket_years: student.atmiya_cricket_years || '',
      atmiya_youth_shibir: student.atmiya_youth_shibir || false,
      atmiya_youth_years: student.atmiya_youth_years || '',
      yuva_mahotsav: student.yuva_mahotsav || false,
      yuva_mahotsav_years: student.yuva_mahotsav_years || '',
      harimay: student.harimay || false,
    });
    setShowEditModal(true);
  }, []);

  // New handler to view full student details
  const handleView = useCallback((student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  }, []);

  const saveEditChanges = useCallback(async () => {
    if (!selectedStudent?._id) return;
    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/students?id=${selectedStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update student');
      }
      setShowEditModal(false);
      showToastMessage('Student updated successfully', 'success');
      fetchStudents(currentPage, perPage, searchTerm.trim());
    } catch (error) {
      console.error('Error updating student:', error);
      showToastMessage(error.message, 'danger');
    } finally {
      setIsSavingEdit(false);
    }
  }, [selectedStudent, editForm, showToastMessage, fetchStudents, currentPage, perPage, searchTerm]);

  const handleDelete = useCallback(async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/students?id=${studentId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student');
      }
      showToastMessage(`Student ${studentName} deleted successfully`, 'success');
      const newTotalRows = totalRows - 1;
      if (students.length === 1 && currentPage > 1) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        fetchStudents(prevPage, perPage, searchTerm.trim());
      } else {
        setTotalRows(newTotalRows);
        fetchStudents(currentPage, perPage, searchTerm.trim());
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      showToastMessage(error.message, 'danger');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToastMessage, totalRows, students.length, currentPage, fetchStudents, perPage, searchTerm]);

  const handleAddCallLog = useCallback((student) => {
    if (!student) return;
    setSelectedStudent(student);
    setCallLog({ status: 'Completed', notes: '', needs_follow_up: false, follow_up_date: '' });
    setShowCallLogModal(true);
  }, []);

  const saveCallLog = useCallback(async () => {
    if (!selectedStudent?._id) return;
    if (callLog.needs_follow_up && !callLog.follow_up_date) {
      showToastMessage('Please provide a follow-up date.', 'danger');
      return;
    }
    setIsSavingCallLog(true);
    try {
      const response = await fetch('/api/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent._id, ...callLog }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save call log');
      }
      setShowCallLogModal(false);
      showToastMessage('Call log added successfully', 'success');
    } catch (error) {
      console.error('Error saving call log:', error);
      showToastMessage(error.message, 'danger');
    } finally {
      setIsSavingCallLog(false);
    }
  }, [selectedStudent, callLog, showToastMessage]);

  // --- Table Columns Definition (Mobile Focus) ---
  const columns = useMemo(() => [
    {
      name: 'Student & Contact',
      selector: row => `${row.first_name || ''} ${row.last_name || ''}`,
      sortable: true,
      grow: 3,
      minWidth: '250px',
      cell: row => {
        const name = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A';
        const initial = row.first_name ? row.first_name[0].toUpperCase() : '?';
        const avatarColor = stringToColor(row._id || name);

        return (
          <div className="d-flex align-items-center py-1 w-100">
            <div
              className="avatar-circle me-3 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: avatarColor, fontSize: '1rem'
              }}
              title={name}
            >
              {initial}
            </div>
            <div className="flex-grow-1" style={{ lineHeight: '1.4' }}>
              <div className="fw-bold text-truncate">{name}</div>
              <div className="small mt-1">
                {row.phone ? (
                  <a href={`tel:${row.phone}`} className="text-decoration-none d-inline-flex align-items-center text-primary fw-medium">
                    <i className="fas fa-mobile-alt me-1 opacity-75"></i>
                    {row.phone}
                  </a>
                ) : (
                  <span className="text-muted fst-italic d-inline-flex align-items-center">
                    <i className="fas fa-mobile-alt me-1 text-muted"></i> N/A
                  </span>
                )}
              </div>
              <div className="text-muted small mt-1" style={{ wordBreak: 'break-all' }}>
                {row.mail_id ? (
                  <a href={`mailto:${row.mail_id}`} className="text-decoration-none text-muted d-inline-flex align-items-center">
                    <i className="fas fa-envelope me-1 opacity-75 small"></i>
                    {row.mail_id}
                  </a>
                ) : (
                  <span className="fst-italic d-inline-flex align-items-center">
                    <i className="fas fa-envelope me-1 text-muted small"></i> No email
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: 'Education',
      selector: row => row.education,
      sortable: true,
      minWidth: '120px',
      grow: 1,
      cell: row => (
        row.education ? (
          <Badge bg="light" text="dark" className="border small fw-normal text-truncate" style={{ maxWidth: '150px' }}>
            {(row.education || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        ) : (
          <span className="text-muted fst-italic small">N/A</span>
        )
      ),
    },
    {
      name: 'Actions',
      button: true,
      allowOverflow: true,
      minWidth: '80px',
      grow: 0,
      cell: row => (
        <DropdownButton
          title={<i className="fas fa-ellipsis-v"></i>}
          size="sm"
          variant="outline-secondary"
          drop="start"
          className="py-0"
        >
          <Dropdown.Item onClick={() => handleView(row)}>
            <i className="fas fa-eye text-info me-2 fa-fw"></i>View Details
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAddCallLog(row)}>
            <i className="fas fa-phone-alt text-success me-2 fa-fw"></i>Add Call Log
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleEdit(row)}>
            <i className="fas fa-edit text-primary me-2 fa-fw"></i>Edit Student
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            className="text-danger"
            onClick={() => handleDelete(row._id, `${row.first_name || ''} ${row.last_name || ''}`.trim())}
          >
            <i className="fas fa-trash me-2 fa-fw"></i>Delete Student
          </Dropdown.Item>
        </DropdownButton>
      ),
    },
  ], [handleEdit, handleDelete, handleAddCallLog, handleView]);

  // --- JSX Render ---
  return (
    <>
      <Head>
        <title>Students - HSAPSS Windsor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
              integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
              crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </Head>

      <Navbar />

      <Container fluid className="py-3 px-sm-3 px-md-4">
        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-3 mb-md-4 gap-2">
          <h1 className="h3 mb-0 text-center text-md-start">Manage Students</h1>
          <div className="d-grid d-md-block">
            <Button variant="success" href="/add-student" as="a" size="sm">
              <i className="fas fa-user-plus me-2"></i>Add New Student
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card shadow-sm">
          <div className="card-header bg-light py-2 px-3">
            <Row className="gy-2 align-items-center">
              <Col xs={12} md="auto">
                <h5 className="mb-0 text-muted small fw-bold">Student Records</h5>
              </Col>
              <Col xs={12} md={6} lg={5} xl={4}>
                <InputGroup size="sm">
                  <InputGroup.Text><i className="fas fa-search"></i></InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    aria-label="Search Students"
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={clearSearch} title="Clear Search" size="sm">
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                </InputGroup>
              </Col>
            </Row>
          </div>
          <div className="card-body p-0">
            {mounted ? (
              <div className="table-container">
                <DataTable
                  columns={columns}
                  data={students}
                  progressPending={loading}
                  progressComponent={
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary"/>
                      <p className="mt-2 mb-0 text-muted small">Loading Students...</p>
                    </div>
                  }
                  pagination
                  paginationServer
                  paginationTotalRows={totalRows}
                  onChangeRowsPerPage={handlePerRowsChange}
                  onChangePage={handlePageChange}
                  paginationPerPage={perPage}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                  highlightOnHover
                  responsive
                  dense
                  customStyles={customTableStyles}
                  noDataComponent={
                    <div className="text-center p-4">
                      <i className="fas fa-users-slash fa-2x text-muted mb-2"></i>
                      <h6 className="text-muted">No Students Found</h6>
                      <p className="text-muted small mb-0">
                        {searchTerm ? `No results for "${searchTerm}".` : 'Add students to see them here.'}
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="text-center p-5">
                <Spinner animation="border" variant="secondary" size="sm"/>
                <p className="mt-2 mb-0 text-muted small">Initializing Table...</p>
              </div>
            )}
          </div>
          <div className="card-footer text-muted text-end small py-1 px-3 d-none d-md-block">
            Showing {students.length > totalRows ? totalRows : students.length} of {totalRows} students
          </div>
        </div>
      </Container>

      {/* --- Edit Student Modal --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h6">
            <i className="fas fa-user-edit me-2"></i>
            Edit: {selectedStudent?.first_name} {selectedStudent?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 px-4">
          {selectedStudent && (
            <Form id="editStudentForm" onSubmit={(e) => { e.preventDefault(); saveEditChanges(); }}>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="editFirstName">
                  <Form.Label className="small mb-1">First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="text" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} required />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="editLastName" className="mt-2 mt-md-0">
                  <Form.Label className="small mb-1">Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="text" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} required />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="editEmail">
                  <Form.Label className="small mb-1">Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="email" placeholder="student@example.com" value={editForm.mail_id} onChange={(e) => setEditForm({ ...editForm, mail_id: e.target.value })} required />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="editPhone" className="mt-2 mt-md-0">
                  <Form.Label className="small mb-1">Phone <span className="text-danger">*</span></Form.Label>
                  <Form.Control size="sm" type="tel" placeholder="+1-555-123-4567" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
                </Form.Group>
              </Row>
              <Form.Group className="mb-3" controlId="editAddress">
                <Form.Label className="small mb-1">Address</Form.Label>
                <Form.Control size="sm" type="text" placeholder="123 Main St..." value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </Form.Group>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="editDob">
                  <Form.Label className="small mb-1">Date of Birth</Form.Label>
                  <Form.Control size="sm" type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="editEducation" className="mt-2 mt-md-0">
                  <Form.Label className="small mb-1">Education</Form.Label>
                  <Form.Select size="sm" value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}>
                    <option value="">Select Education</option>
                    <option value="masters">Masters</option>
                    <option value="pg_diploma">PG Diploma</option>
                  </Form.Select>
                </Form.Group>
              </Row>
              <Form.Group className="mb-3" controlId="editEmergencyContact">
                <Form.Label className="small mb-1">Emergency Contact</Form.Label>
                <Form.Control size="sm" type="text" placeholder="Name - Phone (e.g., Jane Doe - 555-987-6543)" value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} />
              </Form.Group>
              {/* New Section: Event Participation */}
              <h6 className="mt-3">Event Participation</h6>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Check
                    type="checkbox"
                    id="editBoxCricket"
                    label="Box Cricket"
                    checked={editForm.box_cricket}
                    onChange={(e) => setEditForm({ ...editForm, box_cricket: e.target.checked })}
                  />
                  {editForm.box_cricket && (
                    <Form.Control size="sm" type="number" placeholder="Years" value={editForm.box_cricket_years} onChange={(e) => setEditForm({ ...editForm, box_cricket_years: e.target.value })} className="mt-1" />
                  )}
                </Col>
                <Col xs={12} md={6}>
                  <Form.Check
                    type="checkbox"
                    id="editAtmiyaCricket"
                    label="Atmiya Cricket Tournament"
                    checked={editForm.atmiya_cricket_tournament}
                    onChange={(e) => setEditForm({ ...editForm, atmiya_cricket_tournament: e.target.checked })}
                  />
                  {editForm.atmiya_cricket_tournament && (
                    <Form.Control size="sm" type="number" placeholder="Years" value={editForm.atmiya_cricket_years} onChange={(e) => setEditForm({ ...editForm, atmiya_cricket_years: e.target.value })} className="mt-1" />
                  )}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Check
                    type="checkbox"
                    id="editAtmiyaYouth"
                    label="Atmiya Youth Shibir"
                    checked={editForm.atmiya_youth_shibir}
                    onChange={(e) => setEditForm({ ...editForm, atmiya_youth_shibir: e.target.checked })}
                  />
                  {editForm.atmiya_youth_shibir && (
                    <Form.Control size="sm" type="number" placeholder="Years" value={editForm.atmiya_youth_years} onChange={(e) => setEditForm({ ...editForm, atmiya_youth_years: e.target.value })} className="mt-1" />
                  )}
                </Col>
                <Col xs={12} md={6}>
                  <Form.Check
                    type="checkbox"
                    id="editYuvaMahotsav"
                    label="Yuva Mahotsav"
                    checked={editForm.yuva_mahotsav}
                    onChange={(e) => setEditForm({ ...editForm, yuva_mahotsav: e.target.checked })}
                  />
                  {editForm.yuva_mahotsav && (
                    <Form.Control size="sm" type="number" placeholder="Years" value={editForm.yuva_mahotsav_years} onChange={(e) => setEditForm({ ...editForm, yuva_mahotsav_years: e.target.value })} className="mt-1" />
                  )}
                </Col>
              </Row>
              <Form.Check
                type="checkbox"
                id="editHarimay"
                label="Harimay"
                checked={editForm.harimay}
                onChange={(e) => setEditForm({ ...editForm, harimay: e.target.checked })}
                className="mb-3"
              />
              <Form.Group className="mb-2" controlId="editNotes">
                <Form.Label className="small mb-1">Notes</Form.Label>
                <Form.Control size="sm" as="textarea" rows={3} placeholder="Additional notes..." value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="px-3 py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowEditModal(false)} disabled={isSavingEdit}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="editStudentForm" disabled={isSavingEdit || !selectedStudent}>
            {isSavingEdit ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i> Save
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Add Call Log Modal --- */}
      <Modal show={showCallLogModal} onHide={() => setShowCallLogModal(false)} centered backdrop="static" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h6"><i className="fas fa-phone-alt me-2"></i>Add Call Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 px-4">
          {selectedStudent && (
            <Form id="callLogForm" onSubmit={(e) => { e.preventDefault(); saveCallLog(); }}>
              <Form.Group className="mb-3">
                <Form.Label className="small mb-1">Student</Form.Label>
                <Form.Control size="sm" type="text" readOnly disabled value={`${selectedStudent.first_name} ${selectedStudent.last_name}`} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="callLogStatus">
                <Form.Label className="small mb-1">Status <span className="text-danger">*</span></Form.Label>
                <Form.Select size="sm" value={callLog.status} onChange={(e) => setCallLog({ ...callLog, status: e.target.value })} required >
                  <option value="Completed">Completed</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Left Message">Left Message</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Wrong Number">Wrong Number</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="callLogNotes">
                <Form.Label className="small mb-1">Notes</Form.Label>
                <Form.Control size="sm" as="textarea" rows={3} placeholder="Details about the call..." value={callLog.notes} onChange={(e) => setCallLog({ ...callLog, notes: e.target.value })} />
              </Form.Group>
              <Form.Check
                type="checkbox"
                id="needsFollowUpCheck"
                label={<span className="small">Needs Follow-up?</span>}
                checked={callLog.needs_follow_up}
                onChange={(e) => setCallLog({ ...callLog, needs_follow_up: e.target.checked, follow_up_date: e.target.checked ? callLog.follow_up_date : '' })}
                className="mb-2"
              />
              {callLog.needs_follow_up && (
                <Form.Group controlId="followUpDate" className="mb-2">
                  <Form.Label className="small mb-1">Follow-up Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={callLog.follow_up_date}
                    onChange={(e) => setCallLog({ ...callLog, follow_up_date: e.target.value })}
                    required={callLog.needs_follow_up}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="px-3 py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowCallLogModal(false)} disabled={isSavingCallLog}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" form="callLogForm" disabled={isSavingCallLog || !selectedStudent}>
            {isSavingCallLog ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i> Save Log
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- View Student Details Modal --- */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title className="h6">
            Student Details: {selectedStudent?.first_name} {selectedStudent?.last_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <Container>
              <Row className="mb-2">
                <Col xs={4}><strong>First Name:</strong></Col>
                <Col xs={8}>{selectedStudent.first_name || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Last Name:</strong></Col>
                <Col xs={8}>{selectedStudent.last_name || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Email:</strong></Col>
                <Col xs={8}>{selectedStudent.mail_id || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Phone:</strong></Col>
                <Col xs={8}>{selectedStudent.phone || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Address:</strong></Col>
                <Col xs={8}>{selectedStudent.address || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Date of Birth:</strong></Col>
                <Col xs={8}>{selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Education:</strong></Col>
                <Col xs={8}>
                  {selectedStudent.education 
                    ? (selectedStudent.education === 'masters' ? 'Masters' : selectedStudent.education === 'pg_diploma' ? 'PG Diploma' : selectedStudent.education)
                    : 'N/A'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Box Cricket:</strong></Col>
                <Col xs={8}>
                  {selectedStudent.box_cricket ? `Yes (${selectedStudent.box_cricket_years || '-'} years)` : 'No'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Atmiya Cricket Tournament:</strong></Col>
                <Col xs={8}>
                  {selectedStudent.atmiya_cricket_tournament ? `Yes (${selectedStudent.atmiya_cricket_years || '-'} years)` : 'No'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Atmiya Youth Shibir:</strong></Col>
                <Col xs={8}>
                  {selectedStudent.atmiya_youth_shibir ? `Yes (${selectedStudent.atmiya_youth_years || '-'} years)` : 'No'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Yuva Mahotsav:</strong></Col>
                <Col xs={8}>
                  {selectedStudent.yuva_mahotsav ? `Yes (${selectedStudent.yuva_mahotsav_years || '-'} years)` : 'No'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Harimay:</strong></Col>
                <Col xs={8}>{selectedStudent.harimay ? 'Yes' : 'No'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Emergency Contact:</strong></Col>
                <Col xs={8}>{selectedStudent.emergency_contact || 'N/A'}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4}><strong>Notes:</strong></Col>
                <Col xs={8}>{selectedStudent.notes || 'N/A'}</Col>
              </Row>
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Toast Notification --- */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed bottom-0 start-50 start-md-auto end-md-0 translate-middle-x p-3 p-md-3"
        style={{ zIndex: 1150, width: 'auto', minWidth: '250px', maxWidth: '90%' }}
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3500}
          autohide
          bg={toastInfo.variant.toLowerCase()}
          className="d-flex align-items-center text-white shadow rounded"
        >
          <div className="toast-body d-flex align-items-center small p-2">
            {toastInfo.variant === 'success' && <i className="fas fa-check-circle me-2"></i>}
            {toastInfo.variant === 'danger' && <i className="fas fa-exclamation-triangle me-2"></i>}
            {toastInfo.message}
          </div>
          <Button
            onClick={() => setShowToast(false)}
            variant={null}
            className="btn-close btn-close-white me-2 m-auto p-1"
            aria-label="Close"
          ></Button>
        </Toast>
      </div>

      {/* Additional global CSS for adjustments */}
      <style jsx global>{`
        .rdt_TableRow > div[data-column-id] {
          font-size: 0.9rem;
        }
        .rdt_TableRow > div[data-column-id] .rdt_ExpanderButton + div > div {
          font-weight: 500;
          margin-bottom: 2px;
        }
        .rdt_TableCell .dropdown-toggle {
          padding: 0.25rem 0.5rem;
        }
        .table-container {
          overflow-x: auto;
        }
      `}</style>
    </>
  );
}
