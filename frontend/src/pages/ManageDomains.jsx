import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDomains,
  addDomain,
  updateDomain,
  deleteDomain,
} from "../services/api";

function ManageDomains() {
  const [domains, setDomains] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    sub_domain: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await getDomains();
      setDomains(res.data);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sub_domain: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateDomain(editingId, formData);
        alert("Domain updated successfully");
      } else {
        await addDomain(formData);
        alert("Domain added successfully");
      }

      resetForm();
      fetchDomains();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save domain");
    }
  };

  const handleEdit = (domain) => {
    setEditingId(domain.id);
    setFormData({
      name: domain.name || "",
      sub_domain: domain.sub_domain || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this domain/sub-domain?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDomain(id);
      alert("Domain deleted successfully");
      fetchDomains();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete domain");
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Manage Domains</h1>
      <p className="subtitle">
        Add, edit, or remove platform domains and sub-domains.
      </p>

      <div className="details-card">
        <h2>{editingId ? "Edit Domain" : "Add New Domain"}</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>Domain Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: Health"
            required
          />

          <label>Sub-domain</label>
          <input
            name="sub_domain"
            value={formData.sub_domain}
            onChange={handleChange}
            placeholder="Example: AMR"
            required
          />

          <div className="top-actions">
            <button className="primary-btn" type="submit">
              {editingId ? "Update Domain" : "Save Domain"}
            </button>

            {editingId && (
              <button
                type="button"
                className="logout-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="details-card">
        <h2>Existing Domains</h2>

        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Sub-domain</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {domains.map((domain) => (
              <tr key={domain.id}>
                <td>{domain.name}</td>
                <td>{domain.sub_domain}</td>
                <td>
                  <button
                    className="small-btn"
                    onClick={() => handleEdit(domain)}
                  >
                    Edit
                  </button>

                  <button
                    className="small-btn danger-btn"
                    onClick={() => handleDelete(domain.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {domains.length === 0 && (
          <p className="empty-text">No domains added yet.</p>
        )}
      </div>
    </div>
  );
}

export default ManageDomains;
