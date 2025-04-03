import { useState } from 'react';
import { Form, Button, Toast, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    mail_id: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    education: '',
    emergency_contact: '',
    notes: ''
  });

  // Utility to display toast messages
  const showToastMessage = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Prevent form submission when Enter is pressed on non-textarea inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent multiple submissions
    if (loading) return;
    console.log('Form submission triggered');
    setLoading(true);
    setError('');
    setShowToast(false);

    // Clean up and normalize form data
    const cleanedFormData = {
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      mail_id: formData.mail_id.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address?.trim() || '',
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || '',
      education: formData.education || '',
      emergency_contact: formData.emergency_contact?.trim() || '',
      notes: formData.notes?.trim() || ''
    };

    // Validate required fields (here we require first name, last name, and phone)
    if (!cleanedFormData.first_name || !cleanedFormData.last_name || !cleanedFormData.phone) {
      const errorMsg = 'Please fill in all required fields (First name, Last name, Phone)';
      setError(errorMsg);
      showToastMessage(errorMsg, 'danger');
      setLoading(false);
      return;
    }

    try {
      // Send POST request to create a new student
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(cleanedFormData)
      });
      const textResponse = await response.text();
      let data = {};
      if (textResponse) {
        try {
          data = JSON.parse(textResponse);
        } catch {
          throw new Error('Failed to parse server response');
        }
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }
      console.log('Student added successfully:', data);
      showToastMessage('Student added successfully!');
      // Clear the form
      setFormData({
        first_name: '',
        last_name: '',
        mail_id: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: '',
        education: '',
        emergency_contact: '',
        notes: ''
      });
      // Redirect to Students table after a short delay
      setTimeout(() => {
        router.push('/students-table');
      }, 2000);
    } catch (err) {
      console.error('Error in form submission:', err);
      const errorMessage = err.message || 'An error occurred while adding the student';
      setError(errorMessage);
      showToastMessage(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Student - HSAPSS Windsor</title>
      </Head>

      <Navbar />

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Add New Student</h4>
              </div>
              <div className="card-body">
                {error && (
                  <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          First Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          required
                          placeholder="Enter first name"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Last Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          required
                          placeholder="Enter last name"
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Email (Optional)</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.mail_id}
                          onChange={(e) => setFormData({ ...formData, mail_id: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Phone <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          placeholder="Enter phone number"
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Education</Form.Label>
                        <Form.Select
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        >
                          <option value="">Select Education</option>
                          <option value="high_school">High School</option>
                          <option value="bachelors">Bachelors</option>
                          <option value="masters">Masters</option>
                          <option value="phd">PhD</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Emergency Contact</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                          placeholder="Enter emergency contact"
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter any additional notes"
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => router.push('/students-table')}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adding Student...
                        </>
                      ) : (
                        'Add Student'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1051 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastVariant === 'success' ? 'success' : 'danger'} delay={3000} autohide>
          <Toast.Header closeButton className={toastVariant === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}>
            <strong className="me-auto">{toastVariant === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className={`fw-semibold ${toastVariant === 'success' ? 'text-success' : 'text-danger'}`}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>

      <style jsx>{`
        .card { border: none; border-radius: 0.5rem; box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15); }
        .card-header { background-color: #f8f9fc; border-bottom: 1px solid #e3e6f0; padding: 1.25rem; }
        .form-control:focus, .form-select:focus {
          border-color: #4e73df;
          box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
        }
        .form-control::placeholder { color: #a8aeb8; }
      `}</style>
    </>
  );
}
