import React from "react";
import { Card, Table, Tag, Input, DatePicker } from "antd";
import dayjs from "dayjs";

const { Search } = Input;

const detailColumns = [
  {
    title: <span style={{ fontWeight: "bold" }}>Date</span>,
    dataIndex: ["_id", "date"],
    key: "date",
    defaultSortOrder: "descend",
    sorter: (a, b) => a._id.date.localeCompare(b._id.date),
    render: (date) => <Tag color="#1677ff" style={{ fontWeight: "bold" }}>{date}</Tag>
  },
  {
    title: <span style={{ fontWeight: "bold"}}>Service</span>,
    dataIndex: ["_id", "service"],
    key: "service",
  },
  {
    title: <span style={{ fontWeight: "bold" }}>Endpoint</span>,
    dataIndex: ["_id", "endpoint"],
    key: "endpoint",
  },
  {
    title: <span style={{ fontWeight: "bold",}}>Method</span>,
    dataIndex: ["_id", "method"],
    key: "method",
    filters: ["GET", "POST", "PUT", "DELETE"].map((m) => ({ text: m, value: m })),
    onFilter: (value, record) => record._id.method === value,
    render: (method) => <Tag color="blue" style={{ fontWeight: "bold" }}>{method}</Tag>,
  },
  {
    title: <span style={{ fontWeight: "bold"}}>Status</span>,
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
      return <Tag color={color} style={{ fontWeight: "bold" }}>{status}</Tag>;
    },
  },
  {
    title: <span style={{ fontWeight: "bold" }}>IP</span>,
    dataIndex: ["_id", "ip"],
    key: "ip",
  },
];


function DetailTable({ filteredStats, searchText, setSearchText }) {
  const [selectedDate, setSelectedDate] = React.useState(null);

  // Fix: Filter logs by selected date (compare only YYYY-MM-DD part)
  const dateFilteredStats = selectedDate
    ? filteredStats.filter(
        (item) => {
          const logDate = dayjs(item._id.date).format("YYYY-MM-DD");
          const selected = dayjs(selectedDate).format("YYYY-MM-DD");
          return logDate === selected;
        }
      )
    : filteredStats;

  return (
    <Card
      title={<span style={{ fontWeight: "bold", fontSize: 18, color: '#1677ff' }}>📑 API Logs (Grouped Details)</span>}
      extra={
        <div style={{ display: "flex", gap: 12 }}>
          <Search
            placeholder="Search by endpoint"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <DatePicker
            allowClear
            onChange={setSelectedDate}
            format="YYYY-MM-DD"
            placeholder="Filter by date"
          />
        </div>
      }
      style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2", marginBottom: 24 }}
    >
      <Table
        rowKey={(record) =>
          `${record._id.service}-${record._id.endpoint}-${record._id.method}-${record._id.status}-${record._id.ip}-${record._id.date}`
        }
        columns={detailColumns}
        dataSource={dateFilteredStats}
        pagination={{ pageSize: 8 }}
        bordered
        size="middle"
        style={{ background: "#fafcff" }}
      />
    </Card>
  );
}

export default DetailTable;
