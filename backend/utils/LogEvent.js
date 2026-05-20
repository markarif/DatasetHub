const db = require("../db");

const logEvent = ({
  event_type,
  user_id = null,
  dataset_id = null,
  session_id = null,
  visitor_id = null,
  page_url = null,
  metadata = null,
}) => {
  const sql = `
    INSERT INTO analytics_events (
      event_type,
      user_id,
      dataset_id,
      session_id,
      visitor_id,
      page_url,
      metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      event_type,
      user_id,
      dataset_id,
      session_id,
      visitor_id,
      page_url,
      metadata ? JSON.stringify(metadata) : null,
    ],
    (err) => {
      if (err) {
        console.error("Analytics logging failed:", err.message);
      }
    }
  );
};

module.exports = logEvent;