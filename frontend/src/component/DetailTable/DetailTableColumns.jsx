import { Tag } from "antd";

export const detailColumns = [
  {
    title: <span style={{ fontWeight: "bold" }}>Date</span>,
    dataIndex: ["_id", "date"],
    key: "date",
    defaultSortOrder: "descend",
    sorter: (a, b) => a._id.date.localeCompare(b._id.date),
    render: (date) => (
      <Tag color="#1677ff" style={{ fontWeight: "bold" }}>{date}</Tag>
    ),
  },
  {
    title: <span style={{ fontWeight: "bold" }}>Service</span>,
    dataIndex: ["_id", "service"],
    key: "service",
  },
  {
    title: <span style={{ fontWeight: "bold" }}>Endpoint</span>,
    dataIndex: ["_id", "endpoint"],
    key: "endpoint",
  },
  {
    title: <span style={{ fontWeight: "bold" }}>Method</span>,
    dataIndex: ["_id", "method"],
    key: "method",
    filters: ["GET", "POST", "PUT", "DELETE"].map((m) => ({
      text: m,
      value: m,
    })),
    onFilter: (value, record) => record._id.method === value,
    render: (method) => (
      <Tag color="blue" style={{ fontWeight: "bold" }}>{method}</Tag>
    ),
  },
  {
    title: <span style={{ fontWeight: "bold" }}>Status</span>,
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
