import React, { useEffect, useState } from "react";
import axios from "axios";

function LogDashboard() {
  const [stats, setStats] = useState([]);
  const [errors, setErrors] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:4000/logs/stats");
      setStats(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err.message);
    }
  };

  const fetchErrors = async () => {
    try {
      const res = await axios.get("http://localhost:4000/logs/errors");
      setErrors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch errors:", err.message);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchErrors();

    const interval = setInterval(() => {
      fetchStats();
      fetchErrors();
    }, 5000); // auto refresh mỗi 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Logger Service Dashboard</h1>

      <h2>Stats (Aggregate per Endpoint)</h2>
      <table border="1" cellPadding="6" cellSpacing="0" style={{ marginBottom: "20px", width: "100%" }}>
        <thead style={{ backgroundColor: "#f2f2f2" }}>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Status</th>
            <th>IP</th>
            <th>Total</th>
            <th>Success</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {stats.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No stats available
              </td>
            </tr>
          ) : (
            stats.map((row, idx) => (
              <tr key={idx}>
                <td>{row._id.date || "-"}</td>
                <td>{row._id.service || "unknown-service"}</td>
                <td>{row._id.endpoint}</td>
                <td>{row._id.method}</td>
                <td>{row._id.status}</td>
                <td>{row._id.ip}</td>
                <td>{row.totalCalls}</td>
                <td style={{ color: "green" }}>{row.successCalls}</td>
                <td style={{ color: "red" }}>{row.errorCalls}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Error Logs (Detailed)</h2>
      <table border="1" cellPadding="6" cellSpacing="0" style={{ width: "100%" }}>
        <thead style={{ backgroundColor: "#ffe6e6" }}>
          <tr>
            <th>Time</th>
            <th>IP</th>
            <th>Service</th>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Status</th>
            <th>Error Message</th>
            <th>Payload</th>
          </tr>
        </thead>
        <tbody>
          {errors.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No error logs
              </td>
            </tr>
          ) : (
            errors.map((err, idx) => (
              <tr key={idx}>
                <td>{err.time}</td>
                <td>{err.ip}</td>
                <td>{err.service}</td>
                <td>{err.endpoint}</td>
                <td>{err.method}</td>
                <td style={{ color: "red" }}>{err.statusCode}</td>
                <td>{err.errorMessage}</td>
                <td>
                  <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(err.payload, null, 2)}
                  </pre>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LogDashboard;
