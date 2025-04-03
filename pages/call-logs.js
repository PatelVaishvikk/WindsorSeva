import { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, Toast } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';

// Dynamically import DataTable with no SSR
const DataTable = dynamic(
  () => import('react-data-table-component').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-3 text-muted">Loading table...</div>
      </div>
    )
  }
);

export default function CallLogs() {
  const [mounted, setMounted] = useState(false);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [callLog, setCallLog] = useState({
    student_id: '',
    status: 'Completed',
    notes: '',
    needs_follow_up: false,
    follow_up_date: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only fetch data once the component is mounted
  useEffect(() => {
    if (mounted) {
      fetchCallLogs(currentPage, perPage);
      fetchStudents();
    }
  }, [mounted, currentPage, perPage, searchTerm]);

  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch call logs data
  const fetchCallLogs = async (page = 1, limit = perPage) => {
    try {
      setLoading(true);
      // Use window.location.origin to get the base URL in production
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/call-logs?page=${page}&limit=${limit}&search=${searchTerm}`);
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch call logs');
      }
      setCallLogs(data.callLogs);
      console.log(data.callLogs);
      setTotalRows(data.total);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching call logs:', error);
      showToastMessage(error.message, 'danger');
      setCallLogs([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for the dropdown
  const fetchStudents = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/students?limit=100`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students');
      }
      setStudents(data.students);
      console.log('Fetched students:', data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
      showToastMessage(error.message, 'danger');
    }
  };

  const handleSearch = debounce((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 500);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Handle add call log: set call log defaults and show the modal
  const handleAddCallLog = () => {
    setCallLog({
      student_id: '',
      status: 'Completed',
      notes: '',
      needs_follow_up: false,
      follow_up_date: ''
    });
    setShowAddModal(true);
  };

  // Save call log to the API
  const saveCallLog = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/call-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callLog)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save call log');
      }
      setShowAddModal(false);
      showToastMessage('Call log saved successfully');
      fetchCallLogs(currentPage, perPage);
    } catch (error) {
      console.error('Error saving call log:', error);
      showToastMessage(error.message, 'danger');
    }
  };

  // Delete call log by id
  const handleDelete = async (logId) => {
    if (!confirm('Are you sure you want to delete this call log?')) return;
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/call-logs?id=${logId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete call log');
      }
      showToastMessage('Call log deleted successfully');
      fetchCallLogs(currentPage, perPage);
    } catch (error) {
      console.error('Error deleting call log:', error);
      showToastMessage(error.message, 'danger');
    }
  };

  const columns = [
    {
      name: 'Student',
      selector: (row) =>
        row.student ? `${row.student.first_name} ${row.student.last_name}` :
      row.student_id ? `${row.student_id.first_name} ${row.student_id.last_name}` : 
      'Unknown Student',
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <div className="avatar-circle me-2">
          {row.student ? row.student.first_name.charAt(0) :
           row.student_id ? row.student_id.first_name.charAt(0) : '?'}
          </div>
          <div>
            <div className="fw-bold">
            {row.student ? `${row.student.first_name} ${row.student.last_name}` :
             row.student_id ? `${row.student_id.first_name} ${row.student_id.last_name}` : 
             'Unknown Student'}
            </div>
            <div className="text-muted small">
            {row.student ? row.student.mail_id :
             row.student_id ? row.student_id.mail_id : 'No email'}
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <Badge bg={
          row.status === 'Completed' ? 'success' :
          row.status === 'No Answer' ? 'danger' :
          row.status === 'Left Message' ? 'warning' :
          'info'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      name: 'Notes',
      selector: (row) => row.notes,
      sortable: true,
      wrap: true,
      cell: (row) => row.notes || 'No notes'
    },
    {
      name: 'Date',
      selector: (row) => row.date,
      sortable: true,
      cell: (row) => {
        try {
          return new Date(row.date).toLocaleString();
        } catch (error) {
          return 'Invalid Date';
        }
      }
    },
    {
      name: 'Follow-up',
      selector: (row) => row.needs_follow_up,
      sortable: true,
      cell: (row) =>
        row.needs_follow_up && row.follow_up_date ? (
          <Badge bg="warning">
            {new Date(row.follow_up_date).toLocaleDateString()}
          </Badge>
        ) : null
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button variant="danger" size="sm" onClick={() => handleDelete(row._id)} title="Delete">
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>Call Logs - HSAPSS Windsor</title>
      </Head>

      <Navbar />

      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Call Logs</h1>
          <Button variant="primary" onClick={handleAddCallLog}>
            <i className="fas fa-plus me-2"></i>Add Call Log
          </Button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search students or notes..."
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {mounted && (
              <DataTable
                columns={columns}
                data={callLogs}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                sortServer
                responsive
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Call Log Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Call Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select
                value={callLog.student_id}
                onChange={(e) => setCallLog({ ...callLog, student_id: e.target.value })}
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.first_name} {student.last_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={callLog.status}
                onChange={(e) => setCallLog({ ...callLog, status: e.target.value })}
                required
              >
                <option value="Completed">Completed</option>
                <option value="No Answer">No Answer</option>
                <option value="Left Message">Left Message</option>
                <option value="Rescheduled">Rescheduled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={callLog.notes}
                onChange={(e) => setCallLog({ ...callLog, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Needs Follow-up"
                checked={callLog.needs_follow_up}
                onChange={(e) => setCallLog({ ...callLog, needs_follow_up: e.target.checked })}
              />
            </Form.Group>

            {callLog.needs_follow_up && (
              <Form.Group className="mb-3">
                <Form.Label>Follow-up Date</Form.Label>
                <Form.Control
                  type="date"
                  value={callLog.follow_up_date}
                  onChange={(e) => setCallLog({ ...callLog, follow_up_date: e.target.value })}
                  required
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveCallLog}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1051 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide style={{ minWidth: '250px' }}>
          <Toast.Header className={toastVariant === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}>
            <strong className="me-auto">{toastVariant === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className={`${toastVariant === 'success' ? 'text-success' : 'text-danger'} fw-semibold`}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
}