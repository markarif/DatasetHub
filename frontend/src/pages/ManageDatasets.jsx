import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDatasets, deleteDataset } from "../services/api";

function ManageDatasets() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const res = await getDatasets();
      setDatasets(res.data);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this dataset?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDataset(id);
      alert("Dataset deleted successfully");
      fetchDatasets();
    } catch (error) {
      console.error(error);
      alert("Failed to delete dataset");
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Manage Datasets</h1>
      <p className="subtitle">
        Edit, update, or remove datasets from the COP DatasetHub.
      </p>

      <div className="details-card">
        <table>
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Domain</th>
              <th>Format</th>
              <th>Access</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id}>
                <td>{dataset.title}</td>
                <td>
                  {dataset.domain_name} / {dataset.sub_domain}
                </td>
                <td>{dataset.format}</td>
                <td>{dataset.access_type}</td>
                <td>
                  <Link
                    to={`/edit-dataset/${dataset.id}`}
                    className="small-btn"
                  >
                    Edit
                  </Link>

                  <button
                    className="small-btn danger-btn"
                    onClick={() => handleDelete(dataset.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {datasets.length === 0 && (
          <p className="empty-text">No datasets available.</p>
        )}
      </div>
    </div>
  );
}

export default ManageDatasets;