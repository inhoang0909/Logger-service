import React from "react";
import { Card, Table, Tag, Input } from "antd";

const { Search } = Input;

const detailColumns = [
  { title: "Date", dataIndex: ["_id", "date"], key: "date", defaultSortOrder: 'descend', sorter: (a, b) => a._id.date.localeCompare(b._id.date) },
  { title: "Service", dataIndex: ["_id", "service"], key: "service" },
  { title: "Endpoint", dataIndex: ["_id", "endpoint"], key: "endpoint" },
  {
    title: "Method",
    dataIndex: ["_id", "method"],
    key: "method",
    filters: ["GET", "POST", "PUT", "DELETE"].map(m => ({ text: m, value: m })),
    onFilter: (value, record) => record._id.method === value,
    render: (method) => <Tag color="blue" style={{ fontWeight: "bold" }}>{method}</Tag>,
  },
  {
    title: "Status",
    dataIndex: ["_id", "status"],
    key: "status",
    filters: [
      { text: "200", value: 200 },
      { text: "500", value: 500 },
      { text: "Others", value: "others" },
    ],
    onFilter: (value, record) => {
      if (value === "others") {
        return record._id.status !== 200 && record._id.status !== 500;
      }
      return record._id.status === value;
    },
    render: (status) => {
      let color = "gold";
      if (status === 200) color = "green";
      else if (status === 500) color = "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  { title: "IP", dataIndex: ["_id", "ip"], key: "ip" },
];

function DetailTable({ filteredStats, searchText, setSearchText }) {
  return (
    <Card
      title="📑 API Logs (Grouped Details)"
      extra={
        <Search
          placeholder="Search by endpoint"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
      }
      style={{ borderRadius: 12 }}
    >
      <Table
        rowKey={(record) => record._id}
        columns={detailColumns}
        dataSource={filteredStats}
        pagination={{ pageSize: 8 }}
        bordered
      />
    </Card>
  );
}

export default DetailTable;
