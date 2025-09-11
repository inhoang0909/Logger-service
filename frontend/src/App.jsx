import React, { useEffect, useState } from "react";
import { Layout, Card, Table, Button, Modal } from "antd";
import { Line } from "@ant-design/charts";
import axios from "axios";

const { Header, Content } = Layout;

function LogDashboard() {
  const [stats, setStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:4000/logs/stats");
      setStats(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/logs");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
    const interval = setInterval(fetchStats, 1000 * 60 * 5); // every 5 min
    return () => clearInterval(interval);
  }, []);

  const chartData = stats.map(item => ({
    date: item._id.date,
    count: item.totalCalls,
  }));
  const chartConfig = { data: chartData, xField: "date", yField: "count", smooth: true };

  const statsColumns = [
    { title: "Date", dataIndex: ["_id", "date"], key: "date" },
    { title: "Service", dataIndex: ["_id", "service"], key: "service" },
    { title: "Endpoint", dataIndex: ["_id", "endpoint"], key: "endpoint" },
    { title: "Method", dataIndex: ["_id", "method"], key: "method" },
    { title: "Status", dataIndex: ["_id", "status"], key: "status" },
    { title: "IP", dataIndex: ["_id", "ip"], key: "ip" },
    { title: "Total", dataIndex: "totalCalls", key: "total" },
    { title: "Success", dataIndex: "successCalls", key: "success", render: val => <span style={{ color: "green" }}>{val}</span> },
    { title: "Error", dataIndex: "errorCalls", key: "error", render: val => <span style={{ color: "red" }}>{val}</span> },
  ];

  const logColumns = [
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp" },
    { title: "Service", dataIndex: "service", key: "service" },
    { title: "Endpoint", dataIndex: "endpoint", key: "endpoint" },
    { title: "Method", dataIndex: "method", key: "method" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => <Button onClick={() => setSelectedLog(record)}>View</Button>,
    },
  ];

  return (
    <Layout style={{ padding: 24 }}>
      <Header style={{ color: "#fff", fontSize: 24 }}>Logger Service Dashboard</Header>
      <Content style={{ marginTop: 24 }}>
        {/* <Card title="API Call Trend" style={{ marginBottom: 24 }}>
          <Line {...chartConfig} />
        </Card> */}

        <Card title="Stats Summary" style={{ marginBottom: 24 }}>
          <Table
            rowKey={(record, idx) => idx}
            columns={statsColumns}
            dataSource={stats}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Card title="All API Logs">
          <Table
            rowKey="id"
            columns={logColumns}
            dataSource={logs}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          visible={!!selectedLog}
          title="Log Details"
          footer={null}
          onCancel={() => setSelectedLog(null)}
        >
          <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
        </Modal>
      </Content>
    </Layout>
  );
}

export default LogDashboard;
