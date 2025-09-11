import React, { useEffect, useState } from "react";
import { Layout, Card, Table, Tag } from "antd";
import { Column } from "@ant-design/charts";
import axios from "axios";

const { Header, Content } = Layout;

function LogDashboard() {
  const [stats, setStats] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://10.13.34.179:4000/logs/stats");
      setStats(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const chartData = stats.map(item => ({
    date: item._id.date,
    count: item.totalCalls,
  }));

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "count",
    height: 300,
    columnWidthRatio: 0.6,
    xAxis: { title: { text: "Date" } },
    yAxis: { title: { text: "Total API Calls" } },
    color: "#1890ff",
  };

  const summaryColumns = [
    { title: "Endpoint", dataIndex: ["_id", "endpoint"], key: "endpoint" },
    { title: "Total Calls", dataIndex: "totalCalls", key: "total" },
    { title: "Success", dataIndex: "successCalls", key: "success" },
    { title: "Error", dataIndex: "errorCalls", key: "error" },
  ];

  const detailColumns = [
    { title: "Date", dataIndex: ["_id", "date"], key: "date" },
    { title: "Service", dataIndex: ["_id", "service"], key: "service" },
    { title: "Endpoint", dataIndex: ["_id", "endpoint"], key: "endpoint" },
    {
      title: "Method",
      dataIndex: ["_id", "method"],
      key: "method",
      filters: [
        { text: "GET", value: "GET" },
        { text: "POST", value: "POST" },
        { text: "PUT", value: "PUT" },
        { text: "DELETE", value: "DELETE" },
      ],
      onFilter: (value, record) => record._id.method === value,
      render: (method) => (
        <Tag color="blue" style={{ fontWeight: "bold" }}>{method}</Tag>
      ),
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
        let color = "yellow";
        if (status === 200) color = "green";
        else if (status === 500) color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "IP", dataIndex: ["_id", "ip"], key: "ip" },
  ];

  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Header style={{ color: "#fff", fontSize: 24 }}>
        Logger Service Dashboard
      </Header>
      <Content style={{ margin: 0, padding: 24, height: "calc(100vh - 64px)", overflow: "auto" }}>
        {/* <Card title="API Calls Trend (This Month)" style={{ marginBottom: 24 }}>
          <Column {...chartConfig} />
        </Card> */}

        <Card title="API Call Summary" style={{ marginBottom: 24 }}>
          <Table
            rowKey={(record, idx) => idx}
            columns={summaryColumns}
            dataSource={stats}
            pagination={{ pageSize: 10 }}
            style={{ border: "2px solid #eee", borderRadius: 8 }}
          />
        </Card>

        <Card title="API Logs (Grouped Details)">
          <Table
            rowKey={(record, idx) => idx}
            columns={detailColumns}
            dataSource={stats}
            pagination={{ pageSize: 10 }}
            style={{ border: "2px solid #eee", borderRadius: 8 }}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default LogDashboard;
