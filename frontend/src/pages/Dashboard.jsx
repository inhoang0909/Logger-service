import React, { useEffect, useState } from "react";
import { Layout, Row, Col } from "antd";
import axios from "axios";
import SummaryChart from "../component/SummaryChart";
import SummaryTable from "../component/SummaryTable";
import DetailTable from "../component/DetailTable/DetailTable";


const { Header, Content } = Layout;

function LogDashboard() {
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://10.13.34.179:4000/logs/stats");
      setStats(res.data.data || []);
    } catch (err) {
      console.error("Error fetchStats:", err);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await axios.get("http://10.13.34.179:4000/logs/monthly-stats");
      setMonthlyStats(res.data.data || []);
    } catch (err) {
      console.error("Error fetchMonthlyStats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchMonthlyStats();
    const interval = setInterval(() => {
      fetchStats();
      fetchMonthlyStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = monthlyStats.map(item => ({
    date: item.date,
    count: item.totalCalls,
  }));

  const summaryData = Object.values(
    stats.reduce((acc, item) => {
      const ep = item._id.endpoint;
      if (!acc[ep]) {
        acc[ep] = {
          endpoint: ep,
          totalCalls: 0,
          successCalls: 0,
          errorCalls: 0,
        };
      }
      acc[ep].totalCalls += item.totalCalls;
      acc[ep].successCalls += item.successCalls;
      acc[ep].errorCalls += item.errorCalls;
      return acc;
    }, {})
  );

  const filteredStats = stats.filter((item) => {
    const endpoint = item._id?.endpoint?.toLowerCase() || "";
    return endpoint.includes(searchText.toLowerCase());
  });

  return (
    <Layout style={{ height: "100vh", width: "100vw" }}>
      <Header style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
        Logger Service Dashboard
      </Header>
      <Content style={{ padding: 24, height: "calc(100vh - 64px)", overflow: "auto" }}>
        <Row gutter={24}>
          <Col span={24}><SummaryChart chartData={chartData} /></Col>
          <Col span={24}><SummaryTable summaryData={summaryData} /></Col>
          <Col span={24}>
            <DetailTable
              filteredStats={filteredStats}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default LogDashboard;
