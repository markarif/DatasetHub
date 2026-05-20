import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addDataset, getDomains } from "../services/api";

function AddDataset() {
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
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const res = await getDomains();
    setDomains(res.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDataset(formData);
      alert("Dataset added successfully");
      navigate("/admin");

      setFormData({
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
    } catch (error) {
      console.error(error);
      alert("Failed to add dataset");
    }
  };

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to datasets</Link>

      <div className="details-card">
        <h1>Add Dataset</h1>
        <p className="subtitle">Upload dataset metadata and access link.</p>

        <form className="form" onSubmit={handleSubmit}>
         <form onSubmit={handleSubmit} className="modern-form-grid">
  <div className="form-group">
    <label>Dataset title</label>
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
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
          {domain.name} / {domain.sub_domain}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>File name</label>
    <input
      type="text"
      name="file_name"
      value={formData.file_name}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>File size</label>
    <input
      type="text"
      name="file_size"
      value={formData.file_size}
      onChange={handleChange}
      placeholder="Example: 2.4 MB"
    />
  </div>

  <div className="form-group">
    <label>Managed By</label>
    <input
      type="text"
      name="responsibility"
      value={formData.responsibility}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>License</label>
    <input
      type="text"
      name="license_type"
      value={formData.license_type}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Source / Owner</label>
    <input
      type="text"
      name="source_owner"
      value={formData.source_owner}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Format</label>
    <select
      name="format"
      value={formData.format}
      onChange={handleChange}
    >
      <option value="">Select format</option>
      <option value="CSV">CSV</option>
      <option value="JSON">JSON</option>
      <option value="API">API</option>
      <option value="PDF">PDF</option>
    </select>
  </div>

  <div className="form-group">
    <label>Access Type</label>
    <select
      name="access_type"
      value={formData.access_type}
      onChange={handleChange}
    >
      <option value="open">Open</option>
      <option value="restricted">Restricted</option>
      <option value="request_access">Request Access</option>
    </select>
  </div>

  <div className="form-group">
    <label>File / API Link</label>
    <input
      type="text"
      name="file_link"
      value={formData.file_link}
      onChange={handleChange}
    />
  </div>

  <div className="form-group full-width">
    <label>Description</label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      rows="5"
    />
  </div>

  <div className="form-group full-width">
    <label>Tags</label>
    <input
      type="text"
      name="tags"
      value={formData.tags}
      onChange={handleChange}
      placeholder="Example: AMR, health, surveillance"
    />
  </div>

  <div className="full-width">
    <button className="primary-btn" type="submit">
      Add Dataset
    </button>
  </div>
</form>
        </form>
      </div>
    </div>
  );
}

export default AddDataset;