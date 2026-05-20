require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const db = require("./db");
const logEvent = require("./utils/logEvent");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "DatasetHub Platform API is running" });
});

/* =========================
   AUTH
========================= */

app.post("/api/register", async (req, res) => {
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, organization)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword, organization], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Registration failed",
          error: err.message,
        });
      }

      logEvent({
        event_type: "user_registered",
      });

      res.json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Login failed",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    logEvent({
      event_type: "user_login",
      user_id: user.id,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        role: user.role,
      },
    });
  });
});

/* =========================
   ANALYTICS TRACKING
========================= */

app.post("/api/track/site-visit", (req, res) => {
  logEvent({
    event_type: "site_visit",
  });

  res.json({ message: "Visit tracked" });
});

/* =========================
   DOMAINS
========================= */

app.get("/api/domains", (req, res) => {
  db.query("SELECT * FROM domains ORDER BY name ASC", (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch domains",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.post("/api/domains", (req, res) => {
  const { name, sub_domain } = req.body;

  if (!name || !sub_domain) {
    return res.status(400).json({
      message: "Domain name and sub-domain are required",
    });
  }

  db.query(
    "INSERT INTO domains (name, sub_domain) VALUES (?, ?)",
    [name, sub_domain],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add domain",
          error: err.message,
        });
      }

      res.json({ message: "Domain added successfully" });
    }
  );
});

app.put("/api/domains/:id", (req, res) => {
  const { name, sub_domain } = req.body;
  const domainId = req.params.id;

  db.query(
    "UPDATE domains SET name = ?, sub_domain = ? WHERE id = ?",
    [name, sub_domain, domainId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update domain",
          error: err.message,
        });
      }

      res.json({ message: "Domain updated successfully" });
    }
  );
});

app.delete("/api/domains/:id", (req, res) => {
  const domainId = req.params.id;

  db.query(
    "SELECT COUNT(*) AS count FROM datasets WHERE domain_id = ?",
    [domainId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to check domain usage",
          error: err.message,
        });
      }

      if (results[0].count > 0) {
        return res.status(400).json({
          message:
            "Cannot delete this domain because it is linked to existing datasets.",
        });
      }

      db.query("DELETE FROM domains WHERE id = ?", [domainId], (err) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete domain",
            error: err.message,
          });
        }

        res.json({ message: "Domain deleted successfully" });
      });
    }
  );
});

/* =========================
   DATASETS
========================= */

app.get("/api/datasets", (req, res) => {
  const sql = `
    SELECT 
      datasets.*,
      domains.name AS domain_name,
      domains.sub_domain
    FROM datasets
    LEFT JOIN domains ON datasets.domain_id = domains.id
    ORDER BY datasets.uploaded_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch datasets",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.get("/api/datasets/:id", (req, res) => {
  const datasetId = req.params.id;
  const userId = req.query.user_id || null;

  const sql = `
    SELECT 
      datasets.*,
      domains.name AS domain_name,
      domains.sub_domain
    FROM datasets
    LEFT JOIN domains ON datasets.domain_id = domains.id
    WHERE datasets.id = ?
  `;

  db.query(sql, [datasetId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch dataset",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    db.query(
      "INSERT INTO views (user_id, dataset_id) VALUES (?, ?)",
      [userId, datasetId],
      () => {}
    );

    logEvent({
      event_type: "dataset_view",
      user_id: userId,
      dataset_id: datasetId,
    });

    res.json(results[0]);
  });
});

app.post("/api/datasets", (req, res) => {
  const {
    title,
    domain_id,
    file_name,
    file_size,
    responsibility,
    description,
    license_type,
    source_owner,
    file_link,
    format,
    access_type,
    tags,
  } = req.body;

  const sql = `
    INSERT INTO datasets 
    (
      title, domain_id, file_name, file_size, responsibility,
      description, license_type, source_owner, file_link,
      format, access_type, tags
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      domain_id,
      file_name,
      file_size,
      responsibility,
      description,
      license_type,
      source_owner,
      file_link,
      format,
      access_type,
      tags,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add dataset",
          error: err.message,
        });
      }

      res.json({ message: "Dataset added successfully" });
    }
  );
});

app.put("/api/datasets/:id", (req, res) => {
  const datasetId = req.params.id;

  const {
    title,
    domain_id,
    file_name,
    file_size,
    responsibility,
    description,
    license_type,
    source_owner,
    file_link,
    format,
    access_type,
    tags,
  } = req.body;

  const sql = `
    UPDATE datasets
    SET
      title = ?,
      domain_id = ?,
      file_name = ?,
      file_size = ?,
      responsibility = ?,
      description = ?,
      license_type = ?,
      source_owner = ?,
      file_link = ?,
      format = ?,
      access_type = ?,
      tags = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      domain_id,
      file_name,
      file_size,
      responsibility,
      description,
      license_type,
      source_owner,
      file_link,
      format,
      access_type,
      tags,
      datasetId,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update dataset",
          error: err.message,
        });
      }

      res.json({ message: "Dataset updated successfully" });
    }
  );
});

app.delete("/api/datasets/:id", (req, res) => {
  const datasetId = req.params.id;

  db.query("DELETE FROM feedback WHERE dataset_id = ?", [datasetId], () => {
    db.query("DELETE FROM downloads WHERE dataset_id = ?", [datasetId], () => {
      db.query("DELETE FROM views WHERE dataset_id = ?", [datasetId], () => {
        db.query(
          "DELETE FROM access_requests WHERE dataset_id = ?",
          [datasetId],
          () => {
            db.query("DELETE FROM datasets WHERE id = ?", [datasetId], (err) => {
              if (err) {
                return res.status(500).json({
                  message: "Failed to delete dataset",
                  error: err.message,
                });
              }

              res.json({ message: "Dataset deleted successfully" });
            });
          }
        );
      });
    });
  });
});

app.post("/api/datasets/:id/download", (req, res) => {
  const datasetId = req.params.id;
  const { user_id } = req.body;

  db.query(
    "INSERT INTO downloads (user_id, dataset_id) VALUES (?, ?)",
    [user_id || null, datasetId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Download tracking failed",
          error: err.message,
        });
      }

      logEvent({
        event_type: "dataset_download",
        user_id: user_id || null,
        dataset_id: datasetId,
      });

      db.query(
        "SELECT file_link FROM datasets WHERE id = ?",
        [datasetId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(404).json({
              message: "Dataset link not found",
            });
          }

          res.json({
            message: "Download tracked successfully",
            file_link: results[0].file_link,
          });
        }
      );
    }
  );
});

/* =========================
   FEEDBACK
========================= */

app.post("/api/feedback", (req, res) => {
  const {
    user_id,
    dataset_id,
    met_need,
    missing_info,
    data_complete,
    format_usable,
    wished_dataset,
    priority_domain,
  } = req.body;

  const sql = `
    INSERT INTO feedback 
    (
      user_id, dataset_id, met_need, missing_info,
      data_complete, format_usable, wished_dataset, priority_domain
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id || null,
      dataset_id,
      met_need,
      missing_info,
      data_complete,
      format_usable,
      wished_dataset,
      priority_domain,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to submit feedback",
          error: err.message,
        });
      }

      logEvent({
        event_type: "feedback_submitted",
        user_id: user_id || null,
        dataset_id,
      });

      res.json({ message: "Feedback submitted successfully" });
    }
  );
});

app.get("/api/admin/feedback-reports", (req, res) => {
  const sql = `
    SELECT 
      f.id,
      f.met_need,
      f.missing_info,
      f.data_complete,
      f.format_usable,
      f.wished_dataset,
      f.priority_domain,
      f.created_at,
      d.title AS dataset_title,
      domains.name AS domain_name,
      domains.sub_domain,
      u.name AS user_name,
      u.email AS user_email,
      u.organization AS user_organization
    FROM feedback f
    LEFT JOIN datasets d ON f.dataset_id = d.id
    LEFT JOIN domains ON d.domain_id = domains.id
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch feedback reports",
        error: err.message,
      });
    }

    res.json(results);
  });
});

/* =========================
   ACCESS REQUESTS
========================= */

app.post("/api/access-requests", (req, res) => {
  const { user_id, dataset_id, reason, intended_use } = req.body;

  const sql = `
    INSERT INTO access_requests (user_id, dataset_id, reason, intended_use)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, dataset_id, reason, intended_use], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to submit access request",
        error: err.message,
      });
    }

    logEvent({
      event_type: "access_request",
      user_id,
      dataset_id,
    });

    res.json({ message: "Access request submitted successfully" });
  });
});

app.get("/api/admin/access-requests", (req, res) => {
  const sql = `
    SELECT 
      ar.id,
      ar.reason,
      ar.intended_use,
      ar.status,
      ar.created_at,
      d.title AS dataset_title,
      u.name AS user_name,
      u.email AS user_email,
      u.organization AS user_organization
    FROM access_requests ar
    LEFT JOIN datasets d ON ar.dataset_id = d.id
    LEFT JOIN users u ON ar.user_id = u.id
    ORDER BY ar.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch access requests",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.put("/api/admin/access-requests/:id", (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE access_requests SET status = ? WHERE id = ?",
    [status, requestId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update access request",
          error: err.message,
        });
      }

      res.json({ message: "Access request updated successfully" });
    }
  );
});

app.get("/api/access-requests/check", (req, res) => {
  const { user_id, dataset_id } = req.query;

  const sql = `
    SELECT *
    FROM access_requests
    WHERE user_id = ?
      AND dataset_id = ?
      AND status = 'approved'
    LIMIT 1
  `;

  db.query(sql, [user_id, dataset_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to check access request",
        error: err.message,
      });
    }

    res.json({ hasAccess: results.length > 0 });
  });
});

/* =========================
   USERS
========================= */

app.get("/api/admin/users", (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      email,
      organization,
      role,
      created_at
    FROM users
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch users",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.post("/api/admin/users", async (req, res) => {
  const { name, email, password, organization, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Name, email, password, and role are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, organization, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, organization, role],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to create user",
            error: err.message,
          });
        }

        res.json({ message: "User created successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.put("/api/admin/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, organization, role } = req.body;

  db.query(
    `
      UPDATE users
      SET name = ?, email = ?, organization = ?, role = ?
      WHERE id = ?
    `,
    [name, email, organization, role, userId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update user",
          error: err.message,
        });
      }

      res.json({ message: "User updated successfully" });
    }
  );
});

app.put("/api/admin/users/:id/role", (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  db.query(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, userId],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update user role",
          error: err.message,
        });
      }

      res.json({ message: "User role updated successfully" });
    }
  );
});

app.delete("/api/admin/users/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM access_requests WHERE user_id = ?", [userId], () => {
    db.query("DELETE FROM feedback WHERE user_id = ?", [userId], () => {
      db.query("DELETE FROM downloads WHERE user_id = ?", [userId], () => {
        db.query("DELETE FROM views WHERE user_id = ?", [userId], () => {
          db.query("DELETE FROM users WHERE id = ?", [userId], (err) => {
            if (err) {
              return res.status(500).json({
                message: "Failed to delete user",
                error: err.message,
              });
            }

            res.json({ message: "User deleted successfully" });
          });
        });
      });
    });
  });
});

app.get("/api/users/:id/profile", (req, res) => {
  const userId = req.params.id;

  const userSql = `
    SELECT id, name, email, organization, role, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(userSql, [userId], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const viewsSql = `
      SELECT 
        v.id,
        v.viewed_at,
        d.title AS dataset_title,
        domains.name AS domain_name,
        domains.sub_domain
      FROM views v
      LEFT JOIN datasets d ON v.dataset_id = d.id
      LEFT JOIN domains ON d.domain_id = domains.id
      WHERE v.user_id = ?
      ORDER BY v.viewed_at DESC
    `;

    const downloadsSql = `
      SELECT 
        dl.id,
        dl.downloaded_at,
        d.title AS dataset_title,
        domains.name AS domain_name,
        domains.sub_domain
      FROM downloads dl
      LEFT JOIN datasets d ON dl.dataset_id = d.id
      LEFT JOIN domains ON d.domain_id = domains.id
      WHERE dl.user_id = ?
      ORDER BY dl.downloaded_at DESC
    `;

    const feedbackSql = `
      SELECT 
        f.id,
        f.met_need,
        f.wished_dataset,
        f.priority_domain,
        f.created_at,
        d.title AS dataset_title
      FROM feedback f
      LEFT JOIN datasets d ON f.dataset_id = d.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;

    db.query(viewsSql, [userId], (err, views) => {
      db.query(downloadsSql, [userId], (err, downloads) => {
        db.query(feedbackSql, [userId], (err, feedback) => {
          res.json({
            user: userResults[0],
            views,
            downloads,
            feedback,
          });
        });
      });
    });
  });
});

/* =========================
   ADMIN ANALYTICS
========================= */

app.get("/api/admin/analytics", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.title,
      d.format,
      d.access_type,
      domains.name AS domain_name,
      domains.sub_domain,
      COUNT(DISTINCT v.id) AS total_views,
      COUNT(DISTINCT dl.id) AS total_downloads
    FROM datasets d
    LEFT JOIN domains ON d.domain_id = domains.id
    LEFT JOIN views v ON d.id = v.dataset_id
    LEFT JOIN downloads dl ON d.id = dl.dataset_id
    GROUP BY d.id
    ORDER BY total_downloads DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch analytics",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.get("/api/admin/platform-analytics", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'site_visit') AS website_visits,
      (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'dataset_view') AS dataset_views,
      (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'dataset_download') AS dataset_downloads,
      (SELECT COUNT(*) FROM analytics_events WHERE event_type = 'user_login') AS user_logins,
      (SELECT COUNT(*) FROM users) AS registered_users,
      (SELECT COUNT(*) FROM datasets) AS total_datasets
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch platform analytics",
        error: err.message,
      });
    }

    res.json(results[0]);
  });
});

app.get("/api/admin/top-datasets", (req, res) => {
  const sql = `
    SELECT 
      d.id,
      d.title,
      SUM(CASE WHEN ae.event_type = 'dataset_view' THEN 1 ELSE 0 END) AS views,
      SUM(CASE WHEN ae.event_type = 'dataset_download' THEN 1 ELSE 0 END) AS downloads
    FROM datasets d
    LEFT JOIN analytics_events ae ON d.id = ae.dataset_id
    GROUP BY d.id
    ORDER BY views DESC, downloads DESC
    LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch top datasets",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.get("/api/admin/analytics-timeseries", (req, res) => {
  const period = req.query.period || "month";

  let groupSelect = "";
  let groupBy = "";

  if (period === "day") {
    groupSelect = "DATE(created_at) AS period";
    groupBy = "DATE(created_at)";
  } else if (period === "week") {
    groupSelect = "CONCAT(YEAR(created_at), '-W', WEEK(created_at)) AS period";
    groupBy = "YEAR(created_at), WEEK(created_at)";
  } else if (period === "quarter") {
    groupSelect =
      "CONCAT(YEAR(created_at), '-Q', QUARTER(created_at)) AS period";
    groupBy = "YEAR(created_at), QUARTER(created_at)";
  } else if (period === "year") {
    groupSelect = "YEAR(created_at) AS period";
    groupBy = "YEAR(created_at)";
  } else {
    groupSelect = "CONCAT(YEAR(created_at), '-', MONTH(created_at)) AS period";
    groupBy = "YEAR(created_at), MONTH(created_at)";
  }

  const sql = `
    SELECT 
      ${groupSelect},
      COUNT(*) AS total_events,
      SUM(CASE WHEN event_type = 'site_visit' THEN 1 ELSE 0 END) AS site_visits,
      SUM(CASE WHEN event_type = 'dataset_view' THEN 1 ELSE 0 END) AS dataset_views,
      SUM(CASE WHEN event_type = 'dataset_download' THEN 1 ELSE 0 END) AS downloads,
      SUM(CASE WHEN event_type = 'user_login' THEN 1 ELSE 0 END) AS logins
    FROM analytics_events
    GROUP BY ${groupBy}
    ORDER BY MIN(created_at) DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch analytics timeseries",
        error: err.message,
      });
    }

    res.json(results);
  });
});

/* =========================
   AI GAP REPORTS
========================= */

app.post("/api/ai-gap-report/generate", (req, res) => {
  const sql = `
    SELECT 
      f.*,
      d.title AS dataset_title,
      domains.name AS domain_name
    FROM feedback f
    LEFT JOIN datasets d ON f.dataset_id = d.id
    LEFT JOIN domains ON d.domain_id = domains.id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, feedbackRows) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to read feedback",
        error: err.message,
      });
    }

    if (feedbackRows.length === 0) {
      return res.status(400).json({
        message: "No feedback available to analyze",
      });
    }

    const priorityDomains = feedbackRows
      .map((item) => item.priority_domain)
      .filter(Boolean);

    const wishedDatasets = feedbackRows
      .map((item) => item.wished_dataset)
      .filter(Boolean);

    const missingInfo = feedbackRows
      .map((item) => item.missing_info)
      .filter(Boolean);

    const topDomain = priorityDomains[0] || "General";

    const summary = `
Users submitted feedback showing demand for datasets in the ${topDomain} domain.
Common missing information includes: ${
      missingInfo.join("; ") || "Not clearly specified"
    }.
Requested datasets include: ${
      wishedDatasets.join("; ") || "No specific dataset requested"
    }.
    `;

    const recommendation = `
Prioritize improving dataset completeness, updating missing metadata, and preparing requested datasets under ${topDomain}.
    `;

    const insertSql = `
      INSERT INTO ai_gap_reports (report_title, domain, summary, recommendation)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        `AI Gap Report - ${new Date().toLocaleDateString()}`,
        topDomain,
        summary,
        recommendation,
      ],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to save AI report",
            error: err.message,
          });
        }

        res.json({
          message: "AI gap report generated successfully",
        });
      }
    );
  });
});

app.get("/api/ai-gap-reports", (req, res) => {
  db.query(
    "SELECT * FROM ai_gap_reports ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch AI reports",
          error: err.message,
        });
      }

      res.json(results);
    }
  );
});

app.post("/api/ai-gap-report/n8n", (req, res) => {
  const webhookUrl = process.env.N8N_AI_GAP_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(400).json({
      message:
        "n8n webhook URL is not configured. Add N8N_AI_GAP_WEBHOOK_URL in your .env file.",
    });
  }

  const sql = `
    SELECT 
      f.id,
      f.met_need,
      f.missing_info,
      f.data_complete,
      f.format_usable,
      f.wished_dataset,
      f.priority_domain,
      f.created_at,
      d.title AS dataset_title,
      domains.name AS domain_name,
      domains.sub_domain,
      u.name AS user_name,
      u.email AS user_email,
      u.organization AS user_organization
    FROM feedback f
    LEFT JOIN datasets d ON f.dataset_id = d.id
    LEFT JOIN domains ON d.domain_id = domains.id
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, async (err, feedbackRows) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch feedback for AI analysis",
        error: err.message,
      });
    }

    if (feedbackRows.length === 0) {
      return res.status(400).json({
        message: "No feedback available for AI analysis",
      });
    }

    try {
      const payload = {
        source: "DatasetHub",
        task: "AI Gap Analysis",
        generated_at: new Date().toISOString(),
        total_feedback: feedbackRows.length,
        feedback: feedbackRows,
      };

      const n8nResponse = await axios.post(webhookUrl, payload);

      res.json({
        message: "Feedback sent to n8n AI workflow successfully",
        n8n_response: n8nResponse.data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to send feedback to n8n",
        error: error.message,
      });
    }
  });
});
// Full analytics activity feed
app.get("/api/admin/activity-feed", (req, res) => {
  const sql = `
    SELECT
      ae.id,
      ae.event_type,
      ae.page_url,
      ae.created_at,

      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.organization AS user_organization,

      d.id AS dataset_id,
      d.title AS dataset_title,

      domains.name AS domain_name,
      domains.sub_domain

    FROM analytics_events ae

    LEFT JOIN users u
      ON ae.user_id = u.id

    LEFT JOIN datasets d
      ON ae.dataset_id = d.id

    LEFT JOIN domains
      ON d.domain_id = domains.id

    ORDER BY ae.created_at DESC
    LIMIT 500
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch analytics activity",
        error: err.message,
      });
    }

    res.json(results);
  });
});
app.get("/api/admin/user-analytics", (req, res) => {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.organization,
      u.role,

      SUM(
        CASE
          WHEN ae.event_type = 'dataset_view'
          THEN 1
          ELSE 0
        END
      ) AS total_views,

      SUM(
        CASE
          WHEN ae.event_type = 'dataset_download'
          THEN 1
          ELSE 0
        END
      ) AS total_downloads,

      SUM(
        CASE
          WHEN ae.event_type = 'user_login'
          THEN 1
          ELSE 0
        END
      ) AS total_logins,

      MAX(ae.created_at) AS last_activity

    FROM users u

    LEFT JOIN analytics_events ae
      ON u.id = ae.user_id

    GROUP BY u.id

    ORDER BY total_views DESC, total_downloads DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch user analytics",
        error: err.message,
      });
    }

    res.json(results);
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`DatasetHub Platform backend running on port ${PORT}`);
});