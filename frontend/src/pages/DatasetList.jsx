import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDatasets, getDomains, api } from "../services/api";

function DatasetList() {
  const [datasets, setDatasets] = useState([]);
  const [domains, setDomains] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [subDomainFilter, setSubDomainFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  fetchDatasets();
  fetchDomains();
  trackSiteVisit();
}, []);

  const fetchDatasets = async () => {
    try {
      const res = await getDatasets();
      setDatasets(res.data);
    } catch (error) {
      console.error("Failed to fetch datasets:", error);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await getDomains();
      setDomains(res.data);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const uniqueDomains = [
    ...new Set(domains.map((item) => item.name).filter(Boolean)),
  ];

  const uniqueSubDomains = [
    ...new Set(
      domains
        .filter((item) => domainFilter === "all" || item.name === domainFilter)
        .map((item) => item.sub_domain)
        .filter(Boolean)
    ),
  ];

  const formats = ["CSV", "JSON", "API", "PDF", "Excel"];

  const accessTypes = ["open", "restricted", "request_access"];

  const filteredDatasets = datasets.filter((dataset) => {
    const searchText = `
      ${dataset.title || ""}
      ${dataset.description || ""}
      ${dataset.domain_name || ""}
      ${dataset.sub_domain || ""}
      ${dataset.tags || ""}
      ${dataset.format || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(searchTerm.toLowerCase());

    const matchesDomain =
      domainFilter === "all" || dataset.domain_name === domainFilter;

    const matchesSubDomain =
      subDomainFilter === "all" || dataset.sub_domain === subDomainFilter;

    const matchesFormat =
      formatFilter === "all" || dataset.format === formatFilter;

    const matchesAccess =
      accessFilter === "all" || dataset.access_type === accessFilter;

    return (
      matchesSearch &&
      matchesDomain &&
      matchesSubDomain &&
      matchesFormat &&
      matchesAccess
    );
  });
  
  const trackSiteVisit = async () => {
  try {
    await api.post("/track/site-visit");
  } catch (error) {
    console.error("Failed to track site visit:", error);
  }
};

  return (
    <div className="page">
      <h1>DatasetHub</h1>
      <p className="subtitle">DatasetHub Access and Intelligence Platform</p>

      <p className="notice-text">
        You can browse datasets freely. Login is required to view full details,
        access files, download datasets, and submit feedback.
      </p>

      <div className="top-actions">
        {user ? (
          <>
            <span className="welcome-text">Welcome, {user.name}</span>

            <Link to="/profile" className="admin-link">
              My Profile
            </Link>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>

            {user.role === "admin" && (
              <>
                <Link to="/admin" className="admin-link">
                  View Admin Dashboard
                </Link>

                <Link to="/add-dataset" className="admin-link add-link">
                  Add Dataset
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="admin-link">
              Login
            </Link>

            <Link to="/register" className="admin-link add-link">
              Register
            </Link>
          </>
        )}
      </div>

      <div className="filter-card">
        <input
          type="text"
          placeholder="Search datasets by title, domain, tags, format..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={domainFilter}
          onChange={(e) => {
            setDomainFilter(e.target.value);
            setSubDomainFilter("all");
          }}
        >
          <option value="all">All Domains</option>
          {uniqueDomains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

        <select
          value={subDomainFilter}
          onChange={(e) => setSubDomainFilter(e.target.value)}
        >
          <option value="all">All Sub-domains</option>
          {uniqueSubDomains.map((subDomain) => (
            <option key={subDomain} value={subDomain}>
              {subDomain}
            </option>
          ))}
        </select>

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
        >
          <option value="all">All Formats</option>
          {formats.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>

        <select
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
        >
          <option value="all">All Access Types</option>
          {accessTypes.map((access) => (
            <option key={access} value={access}>
              {access}
            </option>
          ))}
        </select>
      </div>

      <p className="results-count">
        Showing {filteredDatasets.length} of {datasets.length} datasets
      </p>

      <div className="grid">
        {filteredDatasets.map((dataset) => (
          <div className="card" key={dataset.id}>
            <h3>{dataset.title}</h3>
            <p>{dataset.description}</p>

            <div className="meta">
              <span>{dataset.domain_name}</span>
              <span>{dataset.sub_domain}</span>
              <span>{dataset.format}</span>
              <span>{dataset.access_type}</span>
            </div>

            <Link to={`/datasets/${dataset.id}`} className="card-link">
              View Details
            </Link>
          </div>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="empty-state">
          <h3>No datasets found</h3>
          <p>Try changing your search or filter options.</p>
        </div>
      )}
    </div>
  );
}

export default DatasetList;