// pages/attendance.js
import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Row,
  Col,
  Modal,
  Card,
  Table
} from 'react-bootstrap';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import io from 'socket.io-client';
import Navigation from '../components/Navbar'; 
// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Dynamically import charts with fallback to default export
const Pie = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Pie || mod.default),
  { ssr: false }
);
const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line || mod.default),
  { ssr: false }
);

// Dynamically import QR code reader
const QrScanner = dynamic(
  () => import('react-qr-scanner').then((mod) => mod.default),
  { ssr: false }
);

// Dynamically import DataTable for searchable student list
const DataTable = dynamic(
  () => import('react-data-table-component').then((mod) => mod.default),
  { ssr: false }
);

export default function AttendancePage() {
  // Daily attendance state
  const [assemblyDate, setAssemblyDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // keyed by student ID: boolean
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dailyGraphData, setDailyGraphData] = useState(null);

  // Overall attendance counts (all-time per student)
  const [overallAttendance, setOverallAttendance] = useState({});

  // Trend analysis state
  const [trendStartDate, setTrendStartDate] = useState('');
  const [trendEndDate, setTrendEndDate] = useState('');
  const [trendGraphData, setTrendGraphData] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [resettingHistory, setResettingHistory] = useState(false);

  // QR Attendance state
  const [qrResult, setQrResult] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState('');

  // Global messages and search state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('daily');
  const [searchText, setSearchText] = useState('');

  // Low attendance threshold
  const LOW_ATTENDANCE_THRESHOLD = 50;

  // --- Socket.IO for real-time updates ---
  useEffect(() => {
    const socket = io();
    socket.on('attendanceUpdate', (update) => {
      console.log('Real-time update received:', update);
      refreshDailyData();
    });
    return () => {
      socket.disconnect();
    };
  }, [assemblyDate]);

  // --- Fetch Students ---
  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const res = await fetch('/api/students?limit=0');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch students');
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, []);

  // --- Fetch Daily Attendance when assemblyDate changes ---
  useEffect(() => {
    refreshDailyData();
  }, [assemblyDate]);

  // --- Refresh Daily Attendance Data ---
  const refreshDailyData = async () => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/attendance?assemblyDate=${assemblyDate}&limit=0`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch daily attendance');
      const records = data.attendances || [];
      const daily = {};
      records.forEach(rec => {
        if (rec.student && rec.student._id) {
          daily[rec.student._id] = rec.attended;
        }
      });
      setAttendance(daily);
      const attendedCount = records.filter(r => r.attended).length;
      const absentCount = records.length - attendedCount;
      setDailyGraphData({
        labels: ['Attended', 'Absent'],
        datasets: [{
          data: [attendedCount, absentCount],
          backgroundColor: ['#28a745', '#dc3545']
        }]
      });
    } catch (err) {
      console.error('Error refreshing daily data:', err);
      setError(err.message);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // --- Refresh Overall Attendance (all-time) per student ---
 // --- Refresh Overall Attendance (Fridays only) per student ---
const refreshOverallAttendance = async () => {
    try {
      const res = await fetch('/api/attendance?limit=0');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch overall attendance');
      
      const records = data.attendances || [];
      const overall = {};
      
      records.forEach(rec => {
        // Only count attendance for Friday assemblies
        const assemblyDay = new Date(rec.assemblyDate).getUTCDay();
        if (rec.student && rec.student._id && rec.attended && assemblyDay === 5) {
          const id = rec.student._id;
          overall[id] = (overall[id] || 0) + 1;
        }
      });
      
      setOverallAttendance(overall);
    } catch (err) {
      console.error("Error fetching overall attendance:", err);
    }
  };
  // Load overall attendance on initial load
  useEffect(() => {
    refreshOverallAttendance();
  }, []);

  // --- Calculate Daily Attendance Percentage ---
  const dailyPercentage = dailyGraphData ?
    (dailyGraphData.datasets[0].data[0] / (dailyGraphData.datasets[0].data[0] + dailyGraphData.datasets[0].data[1]) * 100).toFixed(0)
    : null;

  // --- Toggle attendance for a student ---
  const handleToggle = (studentId) => {
    setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // --- Submit Daily Attendance ---
  const handleSubmitDaily = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await Promise.all(
        students.map(async (student) => {
          const attended = attendance[student._id] === true;
          const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student: student._id,
              assemblyDate,
              attended
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to submit attendance');
        })
      );
      setSuccess('Daily attendance submitted successfully!');
      refreshDailyData();
      refreshOverallAttendance();
    } catch (err) {
      console.error("Error submitting daily attendance:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Reset Daily Attendance: Delete all records for current assemblyDate ---
  const handleResetDaily = async () => {
    if (!window.confirm("Are you sure you want to reset all attendance for this assembly date? This action cannot be undone.")) return;
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // First, get all records for the current assembly date
      const res = await fetch(`/api/attendance?assemblyDate=${assemblyDate}&limit=0`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch records');
      
      const records = data.attendances || [];
      
      // Then delete them one by one
      await Promise.all(records.map(async (record) => {
        const deleteRes = await fetch(`/api/attendance?id=${record._id}`, { 
          method: 'DELETE' 
        });
        
        if (!deleteRes.ok) {
          const deleteData = await deleteRes.json();
          throw new Error(deleteData.error || 'Failed to delete record');
        }
      }));
      
      // Clear the current attendance state
      setAttendance({});
      
      // Update success message and refresh data
      setSuccess("Daily attendance has been reset successfully.");
      refreshDailyData();
      refreshOverallAttendance();
    } catch (err) {
      console.error("Error resetting daily attendance:", err);
      setError(`Reset failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Export Daily Attendance as CSV ---
  const exportCSV = () => {
    if (!students || students.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Name,Total Assemblies Attended,Status\r\n";
    students.forEach(student => {
      const attendedStatus = attendance[student._id] ? "Attended" : "Absent";
      const overallCount = overallAttendance[student._id] || 0;
      const row = `${student.first_name} ${student.last_name},${overallCount},${attendedStatus}\r\n`;
      csvContent += row;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${assemblyDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Fetch Trend Data (Friday-to-Friday) ---
  const fetchTrendData = async () => {
    if (!trendStartDate || !trendEndDate) {
      setError('Please provide both start and end dates for trend analysis.');
      return;
    }
    
    setLoadingTrend(true);
    setError('');
    
    try {
      const res = await fetch(`/api/attendance?startDate=${trendStartDate}&endDate=${trendEndDate}&limit=0`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch trend data');
      
      const records = data.attendances || [];
      const fridayRecords = records.filter(record => new Date(record.assemblyDate).getUTCDay() === 5);
      
      const grouped = {};
      fridayRecords.forEach(record => {
        const dateKey = new Date(record.assemblyDate).toISOString().split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = { total: 0, attended: 0 };
        grouped[dateKey].total += 1;
        if (record.attended) grouped[dateKey].attended += 1;
      });
      
      const sortedDates = Object.keys(grouped).sort();
      const percentages = sortedDates.map(date => {
        const { total, attended } = grouped[date];
        return total > 0 ? Math.round((attended / total) * 100) : 0;
      });
      
      setTrendGraphData({
        labels: sortedDates.map(date => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }),
        datasets: [{
          label: 'Attendance Percentage (Fridays)',
          data: percentages,
          fill: false,
          borderColor: '#4e73df',
          tension: 0.1
        }]
      });
    } catch (err) {
      console.error("Error fetching trend data:", err);
      setError(err.message);
    } finally {
      setLoadingTrend(false);
    }
  };

  // --- View History: Only show Friday records for selected student ---
  const viewHistory = async (student) => {
    setHistoryStudent(student);
    setLoadingHistory(true);
    setError('');
    
    try {
      const res = await fetch(`/api/attendance?studentId=${student._id}&limit=0`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history data');
      
      const fridayRecords = (data.attendances || []).filter(record => 
        new Date(record.assemblyDate).getUTCDay() === 5
      );
      
      // Sort records by date (newest first)
      fridayRecords.sort((a, b) => new Date(b.assemblyDate) - new Date(a.assemblyDate));
      
      setHistoryRecords(fridayRecords);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error fetching student history:", err);
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- Reset History: Delete all Friday records for selected student ---
  const handleResetHistory = async () => {
    if (!historyStudent || historyRecords.length === 0) return;
    if (!window.confirm(`Are you sure you want to erase all attendance history for ${historyStudent.first_name} ${historyStudent.last_name}? This action cannot be undone.`)) return;
    
    setResettingHistory(true);
    
    try {
      let deletionErrors = 0;
      
      // Delete each record one by one and count errors
      await Promise.all(historyRecords.map(async (record) => {
        try {
          const res = await fetch(`/api/attendance?id=${record._id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) {
            deletionErrors++;
            throw new Error(data.error || "Failed to delete a record");
          }
        } catch (err) {
          deletionErrors++;
          console.error(`Error deleting record ${record._id}:`, err);
        }
      }));
      
      if (deletionErrors > 0) {
        setError(`Failed to delete ${deletionErrors} records. Please try again.`);
      } else {
        setSuccess("Attendance history reset successfully.");
        setHistoryRecords([]);
        setShowHistoryModal(false);
        refreshOverallAttendance();
      }
    } catch (err) {
      console.error("Error resetting attendance history:", err);
      setError(err.message);
    } finally {
      setResettingHistory(false);
    }
  };

  // --- Refresh All Data ---
  const refreshData = () => {
    setSuccess('');
    setError('');
    refreshDailyData();
    refreshOverallAttendance();
  };

  // --- QR Attendance: Handle scan result and errors ---
  const handleScan = async (result) => {
    if (result && !scanning) {
      setScanning(true);
      setQrResult(result);
      setScanSuccess('');
      
      const student = students.find(s => s._id === result);
      if (student) {
        try {
          const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student: student._id,
              assemblyDate,
              attended: true
            })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to mark QR attendance');
          
          // Update local state
          setAttendance(prev => ({ ...prev, [student._id]: true }));
          setScanSuccess(`✅ Attendance marked for ${student.first_name} ${student.last_name}`);
          
          // Refresh data after a successful scan
          refreshDailyData();
          refreshOverallAttendance();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setScanSuccess('');
          }, 3000);
        } catch (err) {
          console.error("Error marking QR attendance:", err);
          setError(err.message);
        }
      } else {
        setError('Scanned student ID not found.');
      }
      
      // Reset scanning after a short delay to prevent duplicate scans
      setTimeout(() => {
        setScanning(false);
      }, 2000);
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
    setError('QR Scanner error. Please try again.');
  };

  // --- DataTable Columns & Filter ---
  const columns = useMemo(() => [
    {
      name: 'Student Name',
      selector: row => `${row.first_name} ${row.last_name}`,
      sortable: true,
      wrap: true
    },
    {
      name: 'Total Attended',
      selector: row => overallAttendance[row._id] || 0,
      sortable: true,
      right: true,
      cell: row => (
        <div className={overallAttendance[row._id] < 3 ? 'text-danger font-weight-bold' : ''}>
          {overallAttendance[row._id] || 0}
        </div>
      )
    },
    {
      name: 'Today',
      cell: row => (
        <Form.Check 
          type="switch"
          id={`attendance-toggle-${row._id}`}
          checked={attendance[row._id] || false}
          onChange={() => handleToggle(row._id)}
        />
      ),
      center: true
    },
    {
      name: 'History',
      cell: row => (
        <Button 
          variant="outline-info" 
          size="sm"
          onClick={() => viewHistory(row)}
        >
          History
        </Button>
      ),
      center: true
    }
  ], [attendance, overallAttendance]);

  // Filter students by search text
  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [students, searchText]);

  return (
    <>
      <Head>
        <title>Attendance - Weekly Youth Assembly</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <Navigation />
      <Container fluid className="py-4 px-3 px-md-4">
        <h1 className="mb-4 text-center text-md-start">Weekly Youth Assembly</h1>
        
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <Button variant="outline-primary" onClick={refreshData} className="mb-2 mb-md-0">
            <i className="fas fa-sync-alt me-2"></i> Refresh Data
          </Button>
        </div>
        
        <Card className="shadow-sm mb-4">
          <Card.Body className="p-0">
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => { setActiveTab(k); setError(''); setSuccess(''); }}
              className="mb-3"
              fill
            >
              <Tab eventKey="daily" title="Daily Attendance">
                <div className="p-3">
                  <Row className="mb-3 g-2">
                    <Col xs={12} md={4}>
                      <Form.Group controlId="assemblyDate">
                        <Form.Label>Assembly Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={assemblyDate}
                          onChange={(e) => setAssemblyDate(e.target.value)}
                          className="mb-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={4} className="d-flex align-items-end">
                      <Button 
                        variant="outline-secondary" 
                        onClick={exportCSV}
                        className="mb-2 w-100"
                        disabled={students.length === 0}
                      >
                        <i className="fas fa-file-export me-2"></i> Export CSV
                      </Button>
                    </Col>
                    <Col xs={6} md={4} className="d-flex align-items-end">
                      <Button 
                        variant="warning" 
                        onClick={handleResetDaily}
                        className="mb-2 w-100"
                        disabled={submitting || Object.keys(attendance).length === 0}
                      >
                        <i className="fas fa-trash-alt me-2"></i> Reset Daily
                      </Button>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder="🔍 Search students..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </Col>
                  </Row>
                  
                  {(loadingStudents || loadingAttendance) ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading data...</p>
                    </div>
                  ) : (
                    <>
                      {dailyGraphData && dailyPercentage !== null && dailyPercentage < LOW_ATTENDANCE_THRESHOLD && (
                        <Alert variant="warning">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          Warning: Daily attendance is only {dailyPercentage}%!
                        </Alert>
                      )}
                      
                      <div className="table-responsive mb-3">
                        <DataTable
                          title={`Students (${filteredStudents.length})`}
                          columns={columns}
                          data={filteredStudents}
                          pagination
                          responsive
                          highlightOnHover
                          striped
                          progressPending={loadingStudents || loadingAttendance}
                          progressComponent={<Spinner animation="border" variant="primary" />}
                          noDataComponent={<div className="p-4">No students found</div>}
                          fixedHeader
                          fixedHeaderScrollHeight="400px"
                          customStyles={{
                            headRow: {
                              style: {
                                backgroundColor: '#f8f9fa',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                              },
                            },
                          }}
                        />
                      </div>
                      
                      <div className="d-flex justify-content-end my-3">
                        <Button 
                          variant="primary" 
                          onClick={handleSubmitDaily} 
                          disabled={submitting || students.length === 0}
                          className="px-4"
                        >
                          {submitting ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                              <span className="ms-2">Submitting...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i> Submit Attendance
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {dailyGraphData && (
                        <div className="mt-4">
                          <h3 className="text-center h5 mb-3">Attendance Overview for {new Date(assemblyDate).toLocaleDateString()}</h3>
                          <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                            <Pie data={dailyGraphData} options={{
                              plugins: {
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = context.raw;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = Math.round((value / total) * 100);
                                      return `${label}: ${value} (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tab>
              
              <Tab eventKey="trend" title="Attendance Trend">
                <div className="p-3">
                  <Row className="my-3 g-2">
                    <Col xs={12} sm={6} md={4}>
                      <Form.Group controlId="trendStartDate">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={trendStartDate}
                          onChange={(e) => setTrendStartDate(e.target.value)}
                          className="mb-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Form.Group controlId="trendEndDate">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={trendEndDate}
                          onChange={(e) => setTrendEndDate(e.target.value)}
                          className="mb-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4} className="d-flex align-items-end">
                      <Button 
                        variant="secondary" 
                        onClick={fetchTrendData}
                        className="mb-2 w-100"
                        disabled={loadingTrend || !trendStartDate || !trendEndDate}
                      >
                        {loadingTrend ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                            <span className="ms-2">Loading...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-chart-line me-2"></i> Fetch Trend Data
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                  
                  {loadingTrend ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading trend data...</p>
                    </div>
                  ) : trendGraphData ? (
                    <div className="mt-3">
                      <h3 className="text-center h5 mb-3">Attendance Trend (Fridays Only)</h3>
                      <div className="chart-container" style={{ position: 'relative', height: '60vh', maxHeight: '400px' }}>
                        <Line 
                          data={trendGraphData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                  display: true,
                                  text: 'Attendance %'
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: 'Assembly Date'
                                }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-5 bg-light rounded">
                      <p>No trend data available. Please select a date range and click Fetch Trend Data.</p>
                    </div>
                  )}
                </div>
              </Tab>
              
              <Tab eventKey="qr" title="QR Attendance">
                <div className="p-3">
                  <Row className="my-3">
                    <Col xs={12}>
                      <Card className="border-0 shadow-sm">
                        <Card.Body>
                          <Card.Title className="text-center mb-3">Scan Student QR Code</Card.Title>
                          <p className="text-center text-muted mb-4">Hold your device in front of the QR code with student ID.</p>
                          
                          <div className="text-center mb-3">
                            <Form.Group controlId="qrAssemblyDate" className="mb-3">
                              <Form.Label>Recording attendance for:</Form.Label>
                              <Form.Control
                                type="date"
                                value={assemblyDate}
                                onChange={(e) => setAssemblyDate(e.target.value)}
                                className="mb-2 w-50 mx-auto"
                              />
                            </Form.Group>
                          </div>
                          
                          <div className="qr-reader-container mx-auto" style={{ maxWidth: '350px' }}>
                            <QrScanner
                              delay={300}
                              onError={handleError}
                              onScan={handleScan}
                              style={{ width: '100%' }}
                              facingMode="environment"
                            />
                          </div>
                          
                          {scanSuccess && (
                            <Alert variant="success" className="mt-3 text-center">
                              {scanSuccess}
                            </Alert>
                          )}
                          
                          {qrResult && !scanSuccess && (
                            <div className="mt-3 text-center">
                              <p>Scanning QR code...</p>
                              <Spinner animation="border" variant="primary" />
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
        
        {/* History Modal */}
        <Modal 
          show={showHistoryModal} 
          onHide={() => setShowHistoryModal(false)} 
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {historyStudent && `Attendance History for ${historyStudent.first_name} ${historyStudent.last_name}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingHistory ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading attendance history...</p>
              </div>
            ) : historyRecords.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Recorded On</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map(record => (
                    <tr key={record._id}>
                      <td>{new Date(record.assemblyDate).toLocaleDateString()}</td>
                      <td className={record.attended ? 'text-success' : 'text-danger'}>
                        {record.attended ? 'Attended' : 'Absent'}
                      </td>
                      <td>{new Date(record.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p>No attendance records found for Friday assemblies.</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="danger" 
              onClick={handleResetHistory}
              disabled={resettingHistory || historyRecords.length === 0}
            >
              {resettingHistory ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 
                  <span className="ms-2">Processing...</span>
                </>
              ) : (
                <>Reset Attendance History</>
              )}
            </Button>
            <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}
