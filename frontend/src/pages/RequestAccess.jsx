import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { submitAccessRequest } from "../services/api";

function RequestAccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    reason: "",
    intended_use: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitAccessRequest({
        user_id: user.id,
        dataset_id: id,
        reason: formData.reason,
        intended_use: formData.intended_use,
      });

      alert("Access request submitted successfully");
      navigate(`/datasets/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to submit access request");
    }
  };

  return (
    <div className="page">
      <Link to={`/datasets/${id}`} className="back-link">
        ← Back to dataset
      </Link>

      <div className="details-card">
        <h1>Request Dataset Access</h1>
        <p className="subtitle">
          Explain why you need access and how you intend to use the dataset.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>Reason for request</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            placeholder="Why do you need access to this dataset?"
          />

          <label>Intended use</label>
          <textarea
            name="intended_use"
            value={formData.intended_use}
            onChange={handleChange}
            required
            placeholder="How will you use this dataset?"
          />

          <button className="primary-btn" type="submit">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestAccess;