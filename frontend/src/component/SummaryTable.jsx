import React from "react";
import { Card, Table, Tag } from "antd";

const summaryColumns = [
  { title: <span style={{ fontWeight: "bold" }}>Endpoint</span>, dataIndex: "endpoint", key: "endpoint" },
  {
    title: <span style={{ fontWeight: "bold", color: "#333" }}>Total Calls</span>,
    dataIndex: "totalCalls",
    key: "total",
    render: (val) => <span style={{ fontWeight: "bold", color: "#555" }}>{val}</span>
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#52c41a" }}>Success</span>,
    dataIndex: "successCalls",
    key: "success",
    render: (val) => <Tag color="green" style={{ fontWeight: "bold", fontSize: 15 }}>{val}</Tag>
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#ff4d4f" }}>Error</span>,
    dataIndex: "errorCalls",
    key: "error",
    render: (val) => <Tag color="red" style={{ fontWeight: "bold", fontSize: 15 }}>{val}</Tag>
  },
];

function SummaryTable({ summaryData }) {
  return (
    <Card title={<span style={{ fontWeight: "bold", fontSize: 18, color: '#1677ff' }}>📌 API Call Summary</span>} style={{ marginBottom: 24, borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}>
      <Table
        rowKey={(record, idx) => idx}
        columns={summaryColumns}
        dataSource={summaryData}
        pagination={{ pageSize: 5 }}
        bordered
        size="middle"
        style={{ background: "#fafcff" }}
      />
    </Card>
  );
}

export default SummaryTable;
