import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDatasetById, getDomains, updateDataset } from "../services/api";

function EditDataset() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    domain_id: "",
    file_name: "",
    file_size: "",
    responsibility: "",
    description: "",
    license_type: "",
    source_owner: "",
    file_link: "",
    format: "CSV",
    access_type: "open",
    tags: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const domainRes = await getDomains();
      setDomains(domainRes.data);

      const datasetRes = await getDatasetById(id);
      const dataset = datasetRes.data;

      setFormData({
        title: dataset.title || "",
        domain_id: dataset.domain_id || "",
        file_name: dataset.file_name || "",
        file_size: dataset.file_size || "",
        responsibility: dataset.responsibility || "",
        description: dataset.description || "",
        license_type: dataset.license_type || "",
        source_owner: dataset.source_owner || "",
        file_link: dataset.file_link || "",
        format: dataset.format || "CSV",
        access_type: dataset.access_type || "open",
        tags: dataset.tags || "",
      });
    } catch (error) {
      console.error("Failed to load dataset:", error);
      alert("Failed to load dataset");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateDataset(id, formData);
      alert("Dataset updated successfully");
      navigate("/manage-datasets");
    } catch (error) {
      console.error(error);
      alert("Failed to update dataset");
    }
  };

  return (
    <div className="page">
      <Link to="/manage-datasets" className="back-link">
        ← Back to manage datasets
      </Link>

      <div className="details-card">
        <h1>Edit Dataset</h1>
        <p className="subtitle">Update dataset metadata and access details.</p>

        <form className="form" onSubmit={handleUpdate}>
          <label>Dataset title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Domain</label>
          <select
            name="domain_id"
            value={formData.domain_id}
            onChange={handleChange}
            required
          >
            <option value="">Select domain</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name} - {domain.sub_domain}
              </option>
            ))}
          </select>

          <label>File name</label>
          <input
            name="file_name"
            value={formData.file_name}
            onChange={handleChange}
          />

          <label>File size</label>
          <input
            name="file_size"
            value={formData.file_size}
            onChange={handleChange}
          />

          <label>Responsibility of data collection and management</label>
          <input
            name="responsibility"
            value={formData.responsibility}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <label>License type</label>
          <input
            name="license_type"
            value={formData.license_type}
            onChange={handleChange}
          />

          <label>Source / Owner</label>
          <input
            name="source_owner"
            value={formData.source_owner}
            onChange={handleChange}
          />

          <label>File / API link</label>
          <input
            name="file_link"
            value={formData.file_link}
            onChange={handleChange}
            required
          />

          <label>Format</label>
          <select
            name="format"
            value={formData.format}
            onChange={handleChange}
          >
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
            <option value="API">API</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
          </select>

          <label>Access type</label>
          <select
            name="access_type"
            value={formData.access_type}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="restricted">Restricted</option>
            <option value="request_access">Request Access</option>
          </select>

          <label>Tags / Keywords</label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />

          <button className="primary-btn" type="submit">
            Update Dataset
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditDataset;