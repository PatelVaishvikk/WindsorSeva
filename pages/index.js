// pages/index.js
import { useState, useEffect } from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import Link from 'next/link';
import ChatBot from '../components/ChatBot'; // Import your ChatBot component

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCalls: 0,
    completedCalls: 0,
    pendingCalls: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  
  // State to toggle chatbot visibility
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentCalls();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard-stats');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard statistics');
      }
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentCalls = async () => {
    try {
      const response = await fetch('/api/call-logs?limit=5');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to ensure we're using the correct properties
        const formattedCalls = data.callLogs.map(call => ({
          student: call.student ? `${call.student.first_name} ${call.student.last_name}` :
          call.student_id ? `${call.student_id.first_name} ${call.student_id.last_name}` : 
          'Unknown Student',
          status: call.status || 'Pending',
          notes: call.notes || 'No notes',
          date: new Date(call.date).toLocaleString() || new Date().toLocaleString()
        }));
        setRecentCalls(formattedCalls);
      }
    } catch (error) {
      console.error('Error fetching recent calls:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - HSAPSS Windsor</title>
      </Head>
      <Navbar />
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Dashboard</h1>
          {/* Chat toggle button */}
          <Button variant="info" onClick={() => setShowChat((prev) => !prev)}>
            {showChat ? 'Hide Chat' : 'Chat with AI'}
          </Button>
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary h-100 py-2" style={{ backgroundColor: '#17a2b8', color: 'white' }}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="h5 mb-0 font-weight-bold">
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        stats.totalStudents
                      )}
                    </div>
                    <div className="text-uppercase">Total Students</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-users fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-success h-100 py-2" style={{ backgroundColor: '#ffc107', color: 'white' }}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="h5 mb-0 font-weight-bold">
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        stats.totalCalls
                      )}
                    </div>
                    <div className="text-uppercase">Total Calls</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-phone fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-info h-100 py-2" style={{ backgroundColor: '#28a745', color: 'white' }}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="h5 mb-0 font-weight-bold">
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        stats.completedCalls
                      )}
                    </div>
                    <div className="text-uppercase">Completed Calls</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-warning h-100 py-2" style={{ backgroundColor: '#dc3545', color: 'white' }}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="h5 mb-0 font-weight-bold">
                      {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        stats.pendingCalls
                      )}
                    </div>
                    <div className="text-uppercase">Pending Calls</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-clock fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calls Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Call Logs</h5>
                <Link href="/call-logs" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
              <div className="card-body">
                <Table hover responsive className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Notes</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.length > 0 ? (
                      recentCalls.map((call, index) => (
                        <tr key={index}>
                          <td>{call.student}</td>
                          <td>
                            <span className={`badge bg-${call.status === 'Completed' ? 'success' : 'warning'}`}>
                              {call.status}
                            </span>
                          </td>
                          <td>{call.notes}</td>
                          <td>{call.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No recent calls found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Display */}
        {showChat && (
          <div className="mt-4">
            <ChatBot />
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 0.5rem;
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-3px);
        }
        .card-body {
          padding: 1.25rem;
        }
        .text-uppercase {
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        .fa-2x {
          opacity: 0.8;
        }
      `}</style>
    </>
  );
}
