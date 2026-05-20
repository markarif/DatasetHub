import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  generateAiGapReport,
  getAiGapReports,
  runN8nAiGapAnalysis,
} from "../services/api";

function AiGapReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getAiGapReports();
      setReports(res.data);
    } catch (error) {
      console.error("Failed to fetch AI reports:", error);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await generateAiGapReport();
      alert("Local AI-style gap report generated");
      fetchReports();
    } catch (error) {
      console.error(error);
      alert("Failed to generate report. Make sure feedback exists first.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunN8n = async () => {
    try {
      setLoading(true);
      const res = await runN8nAiGapAnalysis();

      alert(res.data.message || "Feedback sent to n8n AI workflow");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to run n8n AI analysis. Check webhook URL and workflow status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>AI Gap Analysis Reports</h1>
      <p className="subtitle">
        Generate insights from user feedback, missing dataset requests, and
        priority domain needs.
      </p>

      <div className="top-actions">
        <button
          className="primary-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          Generate Local Gap Report
        </button>

        <button
          className="admin-link"
          onClick={handleRunN8n}
          disabled={loading}
        >
          Run n8n AI Analysis
        </button>
      </div>

      <div className="notice-text">
        <strong>Note:</strong> The local report works inside your backend. The
        n8n AI analysis requires a production webhook URL in your backend{" "}
        <strong>.env</strong> file.
      </div>

      <div className="report-list">
        {reports.map((report) => (
          <div className="details-card report-card" key={report.id}>
            <h2>{report.report_title}</h2>

            <div className="details-grid">
              <p>
                <strong>Domain:</strong> {report.domain}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {new Date(report.created_at).toLocaleString()}
              </p>
            </div>

            <h3>Summary</h3>
            <p>{report.summary}</p>

            <h3>Recommendation</h3>
            <p>{report.recommendation}</p>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="empty-state">
          <h3>No AI reports yet</h3>
          <p>
            Generate a local report or connect n8n to create automated AI gap
            analysis.
          </p>
        </div>
      )}
    </div>
  );
}

export default AiGapReports;