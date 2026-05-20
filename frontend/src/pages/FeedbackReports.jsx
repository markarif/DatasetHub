import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeedbackReports } from "../services/api";
import { exportToCSV } from "../services/exportCsv";

function FeedbackReports() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    fetchFeedbackReports();
  }, []);

  const fetchFeedbackReports = async () => {
    try {
      const res = await getFeedbackReports();
      setFeedback(res.data);
    } catch (error) {
      console.error("Failed to fetch feedback reports:", error);
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Feedback Reports</h1>
      <p className="subtitle">
        User feedback collected after dataset access and interaction.
      </p>

      <div className="top-actions">
        <button
          className="primary-btn"
          onClick={() => exportToCSV("feedback_reports.csv", feedback)}
        >
          Export Feedback CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{feedback.length}</p>
        </div>

        <div className="stat-card">
          <h3>Unmet Needs</h3>
          <p>
            {
              feedback.filter(
                (item) => item.met_need === "No" || item.met_need === "Partly"
              ).length
            }
          </p>
        </div>

        <div className="stat-card">
          <h3>Requested Datasets</h3>
          <p>{feedback.filter((item) => item.wished_dataset).length}</p>
        </div>
      </div>

      <div className="feedback-list">
        {feedback.map((item) => (
          <div className="details-card feedback-report-card" key={item.id}>
            <h2>{item.dataset_title || "Unknown Dataset"}</h2>

            <div className="details-grid">
              <p>
                <strong>Domain:</strong> {item.domain_name} /{" "}
                {item.sub_domain}
              </p>
              <p>
                <strong>User:</strong> {item.user_name || "Guest"}
              </p>
              <p>
                <strong>Email:</strong> {item.user_email || "Not captured"}
              </p>
              <p>
                <strong>Organization:</strong>{" "}
                {item.user_organization || "Not captured"}
              </p>
              <p>
                <strong>Met need:</strong> {item.met_need}
              </p>
              <p>
                <strong>Data complete:</strong> {item.data_complete}
              </p>
              <p>
                <strong>Format usable:</strong> {item.format_usable}
              </p>
              <p>
                <strong>Priority domain:</strong> {item.priority_domain}
              </p>
            </div>

            <h3>What was missing?</h3>
            <p>{item.missing_info || "No missing information provided."}</p>

            <h3>Dataset user wishes existed</h3>
            <p>{item.wished_dataset || "No requested dataset provided."}</p>

            <small>
              Submitted on {new Date(item.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>

      {feedback.length === 0 && (
        <div className="empty-state">
          <h3>No feedback submitted yet</h3>
          <p>Feedback will appear here after users submit dataset feedback.</p>
        </div>
      )}
    </div>
  );
}

export default FeedbackReports;