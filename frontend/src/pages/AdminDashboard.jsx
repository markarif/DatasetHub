import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAnalytics } from "../services/api";
import { exportToCSV } from "../services/exportCsv";

function AdminDashboard() {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const totalViews = analytics.reduce(
    (sum, item) => sum + Number(item.total_views || 0),
    0
  );

  const totalDownloads = analytics.reduce(
    (sum, item) => sum + Number(item.total_downloads || 0),
    0
  );

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to datasets
      </Link>

      <h1>Admin Dashboard</h1>
      <p className="subtitle">Dataset usage tracking and platform analytics</p>

      <div className="top-actions">
        <Link to="/add-dataset" className="admin-link add-link">
          Add Dataset
        </Link>

        <Link to="/manage-datasets" className="admin-link">
          Manage Datasets
        </Link>

        <Link to="/manage-domains" className="admin-link">
          Manage Domains
        </Link>

        <Link to="/manage-users" className="admin-link">
  Manage Users
</Link>

        <Link to="/feedback-reports" className="admin-link">
          Feedback Reports
        </Link>

        <Link to="/access-requests" className="admin-link">
          Access Requests
        </Link>

        <Link to="/ai-gap-reports" className="admin-link">
          AI Gap Reports
        </Link>
        <Link to="/analytics" className="admin-link">
  Analytics Dashboard
</Link>

        <button
          className="primary-btn"
          onClick={() => exportToCSV("dataset_analytics.csv", analytics)}
        >
          Export Analytics CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Datasets</h3>
          <p>{analytics.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{totalViews}</p>
        </div>

        <div className="stat-card">
          <h3>Total Downloads</h3>
          <p>{totalDownloads}</p>
        </div>
      </div>

      <div className="details-card">
        <h2>Dataset Performance</h2>

        <table>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Domain</th>
              <th>Format</th>
              <th>Access</th>
              <th>Views</th>
              <th>Downloads</th>
            </tr>
          </thead>

          <tbody>
            {analytics.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                  {item.domain_name} / {item.sub_domain}
                </td>
                <td>{item.format}</td>
                <td>{item.access_type}</td>
                <td>{item.total_views}</td>
                <td>{item.total_downloads}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {analytics.length === 0 && (
          <p className="empty-text">No dataset analytics available yet.</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;