import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getDatasetById,
  trackDownload,
  submitFeedback,
  checkDatasetAccess,
} from "../services/api";

function DatasetDetails() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [hasApprovedAccess, setHasApprovedAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  const [feedback, setFeedback] = useState({
    met_need: "",
    missing_info: "",
    data_complete: "",
    format_usable: "",
    wished_dataset: "",
    priority_domain: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDataset();
  }, [id]);

  const fetchDataset = async () => {
    try {
      const res = await getDatasetById(id, user?.id);
      setDataset(res.data);

      if (res.data.access_type === "open") {
        setHasApprovedAccess(true);
        setAccessChecked(true);
        return;
      }

      if (user?.id) {
        const accessRes = await checkDatasetAccess(user.id, id);
        setHasApprovedAccess(accessRes.data.hasAccess);
      }

      setAccessChecked(true);
    } catch (error) {
      console.error("Failed to fetch dataset:", error);
      setAccessChecked(true);
    }
  };

  const handleDownload = async () => {
    if (!hasApprovedAccess) {
      alert("This dataset requires approved access before download.");
      return;
    }

    try {
      const res = await trackDownload(id, user?.id);

      if (res.data.file_link) {
        window.open(res.data.file_link, "_blank");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed");
    }
  };

  const handleChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    try {
      await submitFeedback({
        user_id: user?.id || null,
        dataset_id: id,
        ...feedback,
      });

      alert("Feedback submitted successfully");

      setFeedback({
        met_need: "",
        missing_info: "",
        data_complete: "",
        format_usable: "",
        wished_dataset: "",
        priority_domain: "",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Feedback failed:", error);
      alert("Failed to submit feedback");
    }
  };

  if (!dataset || !accessChecked) {
    return <div className="page">Loading dataset...</div>;
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to datasets
      </Link>

      <div className="split-layout">
        <div className="main-column">
          <div className="details-card">
            <div className="dataset-header">
              <div>
                <h1>{dataset.title}</h1>
                <p className="subtitle">{dataset.description}</p>
              </div>

              <span className={`access-pill ${dataset.access_type}`}>
                {dataset.access_type}
              </span>
            </div>

            <div className="info-grid">
              <div>
                <small>Domain</small>
                <strong>{dataset.domain_name}</strong>
              </div>

              <div>
                <small>Sub-domain</small>
                <strong>{dataset.sub_domain}</strong>
              </div>

              <div>
                <small>Format</small>
                <strong>{dataset.format}</strong>
              </div>

              <div>
                <small>File Size</small>
                <strong>{dataset.file_size || "Not specified"}</strong>
              </div>

              <div>
                <small>File Name</small>
                <strong>{dataset.file_name || "Not specified"}</strong>
              </div>

              <div>
                <small>License</small>
                <strong>{dataset.license_type || "Not specified"}</strong>
              </div>

              <div>
                <small>Source / Owner</small>
                <strong>{dataset.source_owner || "Not specified"}</strong>
              </div>

              <div>
                <small>Managed By</small>
                <strong>{dataset.responsibility || "Not specified"}</strong>
              </div>
              <div>
  <small>Access Type</small>
  <strong>{dataset.access_type || "Not specified"}</strong>
</div>

<div>
  <small>File / API Link</small>
  <strong>{dataset.file_link || "Not specified"}</strong>
</div>

<div>
  <small>Date Uploaded</small>
  <strong>
    {dataset.uploaded_at
      ? new Date(dataset.uploaded_at).toLocaleDateString()
      : "Not specified"}
  </strong>
</div>

<div>
  <small>Last Updated</small>
  <strong>
    {dataset.updated_at
      ? new Date(dataset.updated_at).toLocaleDateString()
      : "Not specified"}
  </strong>
</div>
            </div>

            <div className="tag-section">
              <h3>Tags</h3>
              <div className="meta">
                {(dataset.tags || "")
                  .split(",")
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag}>{tag.trim()}</span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="side-column">
          <div className="details-card sticky-card">
            <h2>Dataset Access</h2>

            {hasApprovedAccess ? (
              <button className="primary-btn full-btn" onClick={handleDownload}>
                Access / Download Dataset
              </button>
            ) : (
              <>
                <p className="subtitle">
                  This dataset requires approval before access.
                </p>

                <Link
                  to={`/request-access/${dataset.id}`}
                  className="card-link full-btn"
                >
                  Request Access
                </Link>
              </>
            )}
          </div>

          <div className="details-card">
            <h2>Dataset Feedback</h2>
            <p className="subtitle">
              Help us improve data quality and identify missing datasets.
            </p>

            <form onSubmit={handleSubmitFeedback} className="form compact-form">
              <label>Did this dataset meet your need?</label>
              <select
                name="met_need"
                value={feedback.met_need}
                onChange={handleChange}
                required
              >
                <option value="">Select answer</option>
                <option value="Yes">Yes</option>
                <option value="Partly">Partly</option>
                <option value="No">No</option>
              </select>

              <label>What was missing?</label>
              <textarea
                name="missing_info"
                value={feedback.missing_info}
                onChange={handleChange}
                placeholder="Describe missing information"
              />

              <label>Was the data complete?</label>
              <select
                name="data_complete"
                value={feedback.data_complete}
                onChange={handleChange}
              >
                <option value="">Select answer</option>
                <option value="Complete">Complete</option>
                <option value="Partially complete">Partially complete</option>
                <option value="Incomplete">Incomplete</option>
              </select>

              <label>Was the format usable?</label>
              <select
                name="format_usable"
                value={feedback.format_usable}
                onChange={handleChange}
              >
                <option value="">Select answer</option>
                <option value="Usable">Usable</option>
                <option value="Partly usable">Partly usable</option>
                <option value="Not usable">Not usable</option>
              </select>

              <label>What dataset do you wish existed?</label>
              <textarea
                name="wished_dataset"
                value={feedback.wished_dataset}
                onChange={handleChange}
                placeholder="Example: Updated AMR dataset by county"
              />

              <label>Priority domain</label>
              <input
                name="priority_domain"
                value={feedback.priority_domain}
                onChange={handleChange}
                placeholder="Example: Health"
              />

              <button className="primary-btn full-btn" type="submit">
                Submit Feedback
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DatasetDetails;