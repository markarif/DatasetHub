import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getActivityFeed, getUserAnalytics } from "../services/api";
import { exportToCSV } from "../services/exportCsv";
function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [topDatasets, setTopDatasets] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchTopDatasets();
    fetchActivityFeed();
    fetchUserAnalytics();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/admin/platform-analytics");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  const fetchTopDatasets = async () => {
    try {
      const res = await api.get("/admin/top-datasets");
      setTopDatasets(res.data);
    } catch (error) {
      console.error("Failed to fetch top datasets:", error);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      const res = await getActivityFeed();
      setActivityFeed(res.data);
    } catch (error) {
      console.error("Failed to fetch activity feed:", error);
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const res = await getUserAnalytics();
      setUserAnalytics(res.data);
    } catch (error) {
      console.error("Failed to fetch user analytics:", error);
    }
  };

  return (
    <div className="page analytics-page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Analytics Dashboard</h1>

      <p className="subtitle">
        Platform intelligence, dataset analytics, downloads, and user activity.
      </p>

      {summary && (
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <small>Website Visits</small>
            <h2>{summary.website_visits || 0}</h2>
          </div>

          <div className="analytics-stat-card">
            <small>Dataset Views</small>
            <h2>{summary.dataset_views || 0}</h2>
          </div>

          <div className="analytics-stat-card">
            <small>Downloads</small>
            <h2>{summary.dataset_downloads || 0}</h2>
          </div>

          <div className="analytics-stat-card">
            <small>User Logins</small>
            <h2>{summary.user_logins || 0}</h2>
          </div>

          <div className="analytics-stat-card">
            <small>Registered Users</small>
            <h2>{summary.registered_users || 0}</h2>
          </div>

          <div className="analytics-stat-card">
            <small>Total Datasets</small>
            <h2>{summary.total_datasets || 0}</h2>
          </div>
        </div>
      )}

      <div className="analytics-columns">
        <div className="analytics-main">
          <div className="details-card">
            <div className="section-header">
              <div>

                <h2>Top Dataset Rankings</h2>
                <p>Most viewed and downloaded datasets.</p>
              </div>

              <button
  className="small-btn"
  onClick={() => exportToCSV("dataset_rankings.csv", topDatasets)}
>
  Export Rankings
</button>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Views</th>
                    <th>Downloads</th>
                  </tr>
                </thead>

                <tbody>
                  {topDatasets.map((dataset) => (
                    <tr key={dataset.id}>
                      <td>{dataset.title}</td>
                      <td>{dataset.views || 0}</td>
                      <td>{dataset.downloads || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {topDatasets.length === 0 && (
              <p className="empty-text">No ranking data yet.</p>
            )}
          </div>

          <div className="details-card">
            <div className="section-header">
              <div>
                <h2>User Analytics</h2>
                <p>User interactions, downloads, logins, and last activity.</p>
              </div>

              <button
  className="small-btn"
  onClick={() => exportToCSV("user_analytics.csv", userAnalytics)}
>
  Export User Analytics
</button>

            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Views</th>
                    <th>Downloads</th>
                    <th>Logins</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>

                <tbody>
                  {userAnalytics.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.organization || "-"}</td>
                      <td>{user.total_views || 0}</td>
                      <td>{user.total_downloads || 0}</td>
                      <td>{user.total_logins || 0}</td>
                      <td>
                        {user.last_activity
                          ? new Date(user.last_activity).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userAnalytics.length === 0 && (
              <p className="empty-text">No user analytics yet.</p>
            )}
          </div>
        </div>

        <aside className="analytics-side">
          <div className="details-card activity-card">
            <div className="section-header">
              <div>
                <h2>User Activity Feed</h2>
                <p>Recent platform interactions.</p>
              </div>
              <button
  className="small-btn"
  onClick={() => exportToCSV("activity_feed.csv", activityFeed)}
>
  Export Activity Feed
</button>

            </div>

            <div className="activity-feed">
              {activityFeed.map((item) => (
                <div className="activity-item" key={item.id}>
                  <div className="activity-top">
                    <strong>{item.user_name || "Guest"}</strong>
                    <span className="activity-event">{item.event_type}</span>
                  </div>

                  <p className="activity-dataset">
                    {item.dataset_title || "Platform activity"}
                  </p>

                  <div className="activity-meta">
                    <span>{item.user_email || "-"}</span>
                    <span>{item.user_organization || "-"}</span>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>

                  {item.domain_name && (
                    <div className="meta activity-domain">
                      <span>
                        {item.domain_name} / {item.sub_domain}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {activityFeed.length === 0 && (
                <p className="empty-text">No analytics activity recorded yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;