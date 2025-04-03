// // components/DashboardStats.js
// export default function DashboardStats({ stats }) {
//     return (
//         <div className="row g-4 mb-4">
//             {stats.map((stat, index) => (
//                 <div key={index} className="col-12 col-sm-6 col-xl-3">
//                     <div className={`stat-card ${stat.bgClass} text-white`}>
//                         <div className="stat-card-body">
//                             <i className={`fas ${stat.icon} stat-icon`}></i>
//                             <div className="stat-content">
//                                 <h3 className="stat-count">{stat.count}</h3>
//                                 <p className="stat-label">{stat.label}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }
// components/DashboardStats.js
import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import DarkModeToggle from './DarkModeToggle';
export default function DashboardStats({ stats }) {
    const [period, setPeriod] = useState('week');
    const [callStats, setCallStats] = useState({
        totalCalls: 0,
        weeklyChange: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        missedCalls: 0,
        avgDuration: '0:00'
    });
    
    // Sample data - in a real application, this would come from an API
    const sampleData = {
        week: {
            totalCalls: 847,
            weeklyChange: 12.4,
            incomingCalls: 523,
            outgoingCalls: 324,
            missedCalls: 45,
            avgDuration: '4:32',
            dailyCalls: [42, 78, 95, 118, 132, 87, 52],
            callTypes: [
                { name: 'Support', count: 423, color: '#4CAF50' },
                { name: 'Sales', count: 287, color: '#2196F3' },
                { name: 'Billing', count: 98, color: '#FF9800' },
                { name: 'Technical', count: 39, color: '#9C27B0' }
            ],
            topPerformers: [
                { name: 'Sarah Johnson', calls: 78, resolution: 92, avatar: 'SJ' },
                { name: 'Robert Chen', calls: 65, resolution: 88, avatar: 'RC' },
                { name: 'Emma Davis', calls: 59, resolution: 94, avatar: 'ED' },
                { name: 'Michael Smith', calls: 52, resolution: 86, avatar: 'MS' }
            ]
        },
        month: {
            totalCalls: 3542,
            weeklyChange: 8.7,
            incomingCalls: 2187,
            outgoingCalls: 1355,
            missedCalls: 213,
            avgDuration: '5:05',
            dailyCalls: [105, 132, 117, 149, 158, 142, 125, 118, 99, 132, 145, 157, 175, 168, 142, 128, 139, 152, 167, 175, 183, 165, 147, 132, 118, 125, 143, 152, 139, 127],
            callTypes: [
                { name: 'Support', count: 1765, color: '#4CAF50' },
                { name: 'Sales', count: 1232, color: '#2196F3' },
                { name: 'Billing', count: 387, color: '#FF9800' },
                { name: 'Technical', count: 158, color: '#9C27B0' }
            ],
            topPerformers: [
                { name: 'Sarah Johnson', calls: 312, resolution: 90, avatar: 'SJ' },
                { name: 'Robert Chen', calls: 287, resolution: 87, avatar: 'RC' },
                { name: 'Emma Davis', calls: 253, resolution: 92, avatar: 'ED' },
                { name: 'Michael Smith', calls: 241, resolution: 85, avatar: 'MS' }
            ]
        },
        quarter: {
            totalCalls: 10875,
            weeklyChange: 5.2,
            incomingCalls: 6532,
            outgoingCalls: 4343,
            missedCalls: 687,
            avgDuration: '4:58',
            dailyCalls: [358, 372, 412, 438, 463, 425, 402, 387, 398, 412, 432, 458, 475, 462, 423],
            callTypes: [
                { name: 'Support', count: 5287, color: '#4CAF50' },
                { name: 'Sales', count: 3876, color: '#2196F3' },
                { name: 'Billing', count: 1125, color: '#FF9800' },
                { name: 'Technical', count: 587, color: '#9C27B0' }
            ],
            topPerformers: [
                { name: 'Sarah Johnson', calls: 987, resolution: 91, avatar: 'SJ' },
                { name: 'Robert Chen', calls: 865, resolution: 89, avatar: 'RC' },
                { name: 'Emma Davis', calls: 787, resolution: 93, avatar: 'ED' },
                { name: 'Michael Smith', calls: 743, resolution: 87, avatar: 'MS' }
            ]
        }
    };

    useEffect(() => {
        // Update stats based on selected period
        setCallStats(sampleData[period]);
        
        // Initialize charts
        initializeCharts();
        
        return () => {
            // Cleanup charts when component unmounts
            if (window.callVolumeChart) window.callVolumeChart.destroy();
            if (window.callDistributionChart) window.callDistributionChart.destroy();
        };
    }, [period]);
    
    const initializeCharts = () => {
        const currentData = sampleData[period];
        
        // Call volume chart
        const callVolumeCtx = document.getElementById('callVolumeChart');
        if (callVolumeCtx && currentData) {
            if (window.callVolumeChart) window.callVolumeChart.destroy();
            
            const labels = period === 'week' 
                ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                : period === 'month'
                    ? Array.from({length: 30}, (_, i) => i + 1)
                    : Array.from({length: 15}, (_, i) => `Week ${i + 1}`);
            
            window.callVolumeChart = new Chart(callVolumeCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Call Volume',
                        data: currentData.dailyCalls,
                        fill: true,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.4,
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
        
        // Call distribution chart
        const callDistributionCtx = document.getElementById('callDistributionChart');
        if (callDistributionCtx && currentData) {
            if (window.callDistributionChart) window.callDistributionChart.destroy();
            
            window.callDistributionChart = new Chart(callDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: currentData.callTypes.map(type => type.name),
                    datasets: [{
                        data: currentData.callTypes.map(type => type.count),
                        backgroundColor: currentData.callTypes.map(type => type.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                padding: 15
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
    };

    return (
        <div className="dashboard-stats">
            {/* Top bar with period selectors */}
            <div className="period-selector mb-4">
                <h3 className="stats-heading">Call Analytics Dashboard</h3>
                <div className="btn-group">
                    <button 
                        className={`btn ${period === 'week' ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => handlePeriodChange('week')}
                    >
                        Weekly
                    </button>
                    <button 
                        className={`btn ${period === 'month' ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => handlePeriodChange('month')}
                    >
                        Monthly
                    </button>
                    <button 
                        className={`btn ${period === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => handlePeriodChange('quarter')}
                    >
                        Quarterly
                    </button>
                </div>
            </div>
            
            {/* Primary stats cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="stat-card bg-primary text-white">
                        <div className="stat-card-body">
                            <div className="stat-icon-container">
                                <i className="fas fa-phone-alt stat-icon"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-count">{callStats.totalCalls.toLocaleString()}</h3>
                                <p className="stat-label">Total Calls</p>
                                <div className="stat-trend">
                                    <i className={`fas fa-arrow-${callStats.weeklyChange >= 0 ? 'up' : 'down'}`}></i>
                                    <span>{Math.abs(callStats.weeklyChange)}% from previous {period}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="stat-card bg-success text-white">
                        <div className="stat-card-body">
                            <div className="stat-icon-container">
                                <i className="fas fa-headset stat-icon"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-count">{callStats.incomingCalls.toLocaleString()}</h3>
                                <p className="stat-label">Incoming Calls</p>
                                <div className="stat-detail">
                                    <div className="progress stat-progress">
                                        <div 
                                            className="progress-bar" 
                                            style={{width: `${(callStats.incomingCalls / callStats.totalCalls * 100).toFixed(1)}%`}}
                                        ></div>
                                    </div>
                                    <span>{((callStats.incomingCalls / callStats.totalCalls) * 100).toFixed(1)}% of total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="stat-card bg-info text-white">
                        <div className="stat-card-body">
                            <div className="stat-icon-container">
                                <i className="fas fa-phone-volume stat-icon"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-count">{callStats.outgoingCalls.toLocaleString()}</h3>
                                <p className="stat-label">Outgoing Calls</p>
                                <div className="stat-detail">
                                    <div className="progress stat-progress">
                                        <div 
                                            className="progress-bar" 
                                            style={{width: `${(callStats.outgoingCalls / callStats.totalCalls * 100).toFixed(1)}%`}}
                                        ></div>
                                    </div>
                                    <span>{((callStats.outgoingCalls / callStats.totalCalls) * 100).toFixed(1)}% of total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-3">
                    <div className="stat-card bg-danger text-white">
                        <div className="stat-card-body">
                            <div className="stat-icon-container">
                                <i className="fas fa-clock stat-icon"></i>
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-count">{callStats.avgDuration}</h3>
                                <p className="stat-label">Avg. Call Duration</p>
                                <div className="stat-detail">
                                    <span>
                                        <i className="fas fa-times-circle text-white-50 me-1"></i>
                                        {callStats.missedCalls} missed calls
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Charts and detailed stats */}
            <div className="row g-4 mb-4">
                {/* Call volume chart */}
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Call Volume Trends</h5>
                            <div className="dropdown">
                                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="callVolumeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="callVolumeDropdown">
                                    <li><button className="dropdown-item">Download Report</button></li>
                                    <li><button className="dropdown-item">Export as CSV</button></li>
                                    <li><button className="dropdown-item">Print Chart</button></li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="chart-container" style={{height: '300px'}}>
                                <canvas id="callVolumeChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Call distribution chart */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Call Distribution by Type</h5>
                        </div>
                        <div className="card-body">
                            <div className="chart-container" style={{height: '300px'}}>
                                <canvas id="callDistributionChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Additional metrics */}
            <div className="row g-4">
                {/* Top performers */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Top Performing Agents</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Agent</th>
                                            <th className="text-center">Calls Handled</th>
                                            <th className="text-center">Resolution Rate</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {callStats.topPerformers && callStats.topPerformers.map((performer, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className={`avatar-circle bg-primary text-white me-2 avatar-${index}`}>
                                                            {performer.avatar}
                                                        </div>
                                                        <span>{performer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">{performer.calls}</td>
                                                <td className="text-center">{performer.resolution}%</td>
                                                <td className="text-center">
                                                    {index === 0 ? (
                                                        <span className="badge bg-success">Online</span>
                                                    ) : index === 1 ? (
                                                        <span className="badge bg-success">Online</span>
                                                    ) : index === 2 ? (
                                                        <span className="badge bg-warning">Away</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Offline</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card-footer text-center">
                            <button className="btn btn-sm btn-outline-primary">View All Agents</button>
                        </div>
                    </div>
                </div>
                
                {/* Call quality metrics */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Call Quality Metrics</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-4">
                                <div className="col-12 col-sm-6">
                                    <div className="call-quality-item">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>First Call Resolution</span>
                                            <span className="text-success">87%</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar bg-success" style={{width: '87%'}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="call-quality-item">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Customer Satisfaction</span>
                                            <span className="text-primary">92%</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar bg-primary" style={{width: '92%'}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="call-quality-item">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Call Abandonment Rate</span>
                                            <span className="text-warning">12%</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar bg-warning" style={{width: '12%'}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6">
                                    <div className="call-quality-item">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Average Wait Time</span>
                                            <span className="text-info">1m 48s</span>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar bg-info" style={{width: '65%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="my-4" />
                            
                            <div className="busy-hours-container">
                                <h6 className="mb-3">Peak Call Hours</h6>
                                <div className="busy-hours">
                                    {[...Array(24)].map((_, hour) => {
                                        // Calculate activity level (just for demo)
                                        let activity = 0;
                                        if (hour >= 8 && hour <= 18) {
                                            activity = 30 + Math.sin((hour - 8) * 0.5) * 60;
                                        } else if (hour > 18 && hour <= 22) {
                                            activity = 20 - ((hour - 18) * 5);
                                        }
                                        
                                        return (
                                            <div 
                                                key={hour} 
                                                className="hour-bar" 
                                                style={{height: `${activity}px`}}
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="top"
                                                title={`${hour}:00 - ${hour+1}:00: ${Math.round(activity)}% activity`}
                                            ></div>
                                        );
                                    })}
                                </div>
                                <div className="hours-label">
                                    <span>12 AM</span>
                                    <span>6 AM</span>
                                    <span>12 PM</span>
                                    <span>6 PM</span>
                                    <span>12 AM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS for custom elements */}
            <style jsx>{`
                .dashboard-stats {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .period-selector {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .stats-heading {
                    margin: 0;
                    font-weight: 600;
                    color: #344767;
                }
                
                .stat-card {
                    border-radius: 0.75rem;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                    transition: transform 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                
                .stat-card-body {
                    display: flex;
                    padding: 1.5rem;
                }
                
                .stat-icon-container {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 0.5rem;
                    width: 3rem;
                    height: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                }
                
                .stat-icon {
                    font-size: 1.5rem;
                }
                
                .stat-content {
                    flex: 1;
                }
                
                .stat-count {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                    line-height: 1;
                }
                
                .stat-label {
                    margin-bottom: 0.5rem;
                    opacity: 0.8;
                    font-size: 0.875rem;
                }
                
                .stat-trend {
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    opacity: 0.9;
                }
                
                .stat-trend i {
                    margin-right: 0.25rem;
                }
                
                .stat-detail {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                }
                
                .stat-progress {
                    height: 4px;
                    margin-bottom: 0.25rem;
                    background-color: rgba(255, 255, 255, 0.2);
                }
                
                .stat-progress .progress-bar {
                    background-color: rgba(255, 255, 255, 0.8);
                }
                
                .card {
                    border: none;
                    border-radius: 0.75rem;
                }
                
                .card-header {
                    background-color: transparent;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 1.25rem 1.5rem;
                }
                
                .card-title {
                    color: #344767;
                    font-weight: 600;
                }
                
                .card-body {
                    padding: 1.5rem;
                }

                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                
                .avatar-0 { background-color: #3f51b5 !important; }
                .avatar-1 { background-color: #4caf50 !important; }
                .avatar-2 { background-color: #ff9800 !important; }
                .avatar-3 { background-color: #9c27b0 !important; }
                
                .call-quality-item {
                    margin-bottom: 1.25rem;
                }
                
                .busy-hours-container {
                    margin-top: 1rem;
                }
                
                .busy-hours {
                    display: flex;
                    align-items: flex-end;
                    height: 100px;
                    gap: 2px;
                }
                
                .hour-bar {
                    flex: 1;
                    background: linear-gradient(to top, #e0f7fa 0%, #00acc1 100%);
                    border-radius: 2px 2px 0 0;
                }
                
                .hours-label {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                    font-size: 0.7rem;
                    color: #666;
                }
            `}</style>
        </div>
    );
}