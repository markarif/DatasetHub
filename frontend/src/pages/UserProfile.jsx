import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../services/api";

function UserProfile() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile(storedUser.id);
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  if (!profile) {
    return <div className="page">Loading profile...</div>;
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to datasets
      </Link>

      <h1>User Profile</h1>
      <p className="subtitle">Your DatasetHub account and activity history.</p>

      <div className="details-card">
        <h2>{profile.user.name}</h2>

        <div className="details-grid">
          <p>
            <strong>Email:</strong> {profile.user.email}
          </p>
          <p>
            <strong>Organization:</strong> {profile.user.organization}
          </p>
          <p>
            <strong>Role:</strong> {profile.user.role}
          </p>
          <p>
            <strong>Joined:</strong>{" "}
            {new Date(profile.user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="stats-grid profile-stats">
        <div className="stat-card">
          <h3>Datasets Viewed</h3>
          <p>{profile.views.length}</p>
        </div>

        <div className="stat-card">
          <h3>Downloads</h3>
          <p>{profile.downloads.length}</p>
        </div>

        <div className="stat-card">
          <h3>Feedback Submitted</h3>
          <p>{profile.feedback.length}</p>
        </div>
      </div>

      <div className="details-card profile-section">
        <h2>Viewed Datasets</h2>

        <table>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Domain</th>
              <th>Date Viewed</th>
            </tr>
          </thead>

          <tbody>
            {profile.views.map((item) => (
              <tr key={item.id}>
                <td>{item.dataset_title}</td>
                <td>
                  {item.domain_name} / {item.sub_domain}
                </td>
                <td>{new Date(item.viewed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {profile.views.length === 0 && (
          <p className="empty-text">You have not viewed any datasets yet.</p>
        )}
      </div>

      <div className="details-card profile-section">
        <h2>Downloaded Datasets</h2>

        <table>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Domain</th>
              <th>Date Downloaded</th>
            </tr>
          </thead>

          <tbody>
            {profile.downloads.map((item) => (
              <tr key={item.id}>
                <td>{item.dataset_title}</td>
                <td>
                  {item.domain_name} / {item.sub_domain}
                </td>
                <td>{new Date(item.downloaded_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {profile.downloads.length === 0 && (
          <p className="empty-text">You have not downloaded any datasets yet.</p>
        )}
      </div>

      <div className="details-card profile-section">
        <h2>Feedback History</h2>

        <table>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Met Need</th>
              <th>Priority Domain</th>
              <th>Requested Dataset</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {profile.feedback.map((item) => (
              <tr key={item.id}>
                <td>{item.dataset_title}</td>
                <td>{item.met_need}</td>
                <td>{item.priority_domain}</td>
                <td>{item.wished_dataset}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {profile.feedback.length === 0 && (
          <p className="empty-text">You have not submitted feedback yet.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;