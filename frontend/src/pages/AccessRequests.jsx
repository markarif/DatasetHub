import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAccessRequests,
  updateAccessRequestStatus,
} from "../services/api";
import { exportToCSV } from "../services/exportCsv";

function AccessRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getAccessRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch access requests:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAccessRequestStatus(id, status);
      alert(`Request ${status}`);
      window.scrollTo({
  top: 0,
  behavior: "smooth",
});
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to update request");
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Access Requests</h1>
      <p className="subtitle">
        Review and approve requests for restricted datasets.
      </p>

      <div className="top-actions">
        <button
          className="primary-btn"
          onClick={() => exportToCSV("access_requests.csv", requests)}
        >
          Export Requests CSV
        </button>
      </div>

      <div className="feedback-list">
        {requests.map((request) => (
          <div className="details-card feedback-report-card" key={request.id}>
            <h2>{request.dataset_title}</h2>

            <div className="details-grid">
              <p>
                <strong>User:</strong> {request.user_name}
              </p>
              <p>
                <strong>Email:</strong> {request.user_email}
              </p>
              <p>
                <strong>Organization:</strong>{" "}
                {request.user_organization || "Not provided"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${request.status}`}>
                  {request.status}
                </span>
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            <h3>Reason</h3>
            <p>{request.reason}</p>

            <h3>Intended Use</h3>
            <p>{request.intended_use}</p>

            <div className="top-actions">
              <button
                className="small-btn"
                onClick={() => handleStatusUpdate(request.id, "approved")}
              >
                Approve
              </button>

              <button
                className="small-btn danger-btn"
                onClick={() => handleStatusUpdate(request.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="empty-state">
          <h3>No access requests yet</h3>
          <p>Restricted dataset requests will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default AccessRequests;