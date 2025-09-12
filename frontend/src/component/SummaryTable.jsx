import React from "react";
import { Card, Table } from "antd";

const summaryColumns = [
  { title: "Endpoint", dataIndex: "endpoint", key: "endpoint" },
  { title: "Total Calls", dataIndex: "totalCalls", key: "total" },
  { title: "Success", dataIndex: "successCalls", key: "success" },
  { title: "Error", dataIndex: "errorCalls", key: "error" },
];

function SummaryTable({ summaryData }) {
  return (
    <Card title="📌 API Call Summary" style={{ marginBottom: 24, borderRadius: 12 }}>
      <Table
        rowKey={(record, idx) => idx}
        columns={summaryColumns}
        dataSource={summaryData}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
}

export default SummaryTable;
