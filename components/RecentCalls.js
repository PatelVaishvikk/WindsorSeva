// components/RecentCalls.js
export default function RecentCalls({ calls }) {
    return (
        <div className="card mt-4">
            <div className="card-header">
                <h5 className="mb-0">Recent Call Logs</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table id="recentCallsTable" className="table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calls.map((call, index) => (
                                <tr key={index}>
                                    <td>{call.student}</td>
                                    <td>{call.status}</td>
                                    <td>{call.notes}</td>
                                    <td>{new Date(call.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
